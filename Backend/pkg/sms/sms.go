package sms

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
)

// ─── Interface ────────────────────────────────────────────────────────────────

type SMSService interface {
	SendOTP(mobileNumber string, otp string) error
}

// ─── Constructor ─────────────────────────────────────────────────────────────

func NewSMSService() SMSService {
	return &twilioService{
		accountSID: os.Getenv("TWILIO_ACCOUNT_SID"),
		authToken:  os.Getenv("TWILIO_AUTH_TOKEN"),
		fromNumber: os.Getenv("TWILIO_FROM_NUMBER"),
	}
}

// ─── Twilio Implementation ────────────────────────────────────────────────────

type twilioService struct {
	accountSID string
	authToken  string
	fromNumber string
}

// twilioResponse mirrors the subset of Twilio's Message resource we care about.
type twilioResponse struct {
	SID          string  `json:"sid"`
	Status       string  `json:"status"`
	ErrorCode    *int    `json:"error_code"`    // null on success
	ErrorMessage *string `json:"error_message"` // null on success
}

func (s *twilioService) SendOTP(mobileNumber string, otp string) error {
	// ── Dev / no-key mode: just log OTP ──────────────────────────────────
	if s.accountSID == "" || os.Getenv("APP_ENV") == "development" {
		fmt.Printf("📱 [DEV-OTP] Mobile: %s  →  OTP: %s\n", mobileNumber, otp)
		return nil
	}

	// ── Normalise to E.164 (+91 for India if no prefix given) ────────────
	toNumber := mobileNumber
	if !strings.HasPrefix(mobileNumber, "+") {
		toNumber = "+91" + mobileNumber
	}

	// ── Build Twilio Messages API URL ─────────────────────────────────────
	apiURL := fmt.Sprintf(
		"https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json",
		s.accountSID,
	)

	// ── URL-encoded form body ─────────────────────────────────────────────
	form := url.Values{}
	form.Set("From", s.fromNumber)
	form.Set("To", toNumber)
	form.Set("Body", fmt.Sprintf(
		"Your OTP is: %s\nValid for 10 minutes. Do not share this code.",
		otp,
	))

	// ── HTTP request with Basic Auth ──────────────────────────────────────
	req, err := http.NewRequest(
		http.MethodPost,
		apiURL,
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		return fmt.Errorf("sms: failed to create request: %w", err)
	}

	req.SetBasicAuth(s.accountSID, s.authToken)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("sms: request failed: %w", err)
	}
	defer resp.Body.Close()

	// ── Parse response ───────────────────────────────────────────────────
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("sms: failed to read response: %w", err)
	}

	var result twilioResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return fmt.Errorf("sms: failed to parse response: %w", err)
	}

	// Twilio returns 201 Created on success; 4xx on error
	if resp.StatusCode >= 400 {
		msg := fmt.Sprintf("twilio error (HTTP %d)", resp.StatusCode)
		if result.ErrorCode != nil && result.ErrorMessage != nil {
			msg = fmt.Sprintf("twilio error %d: %s", *result.ErrorCode, *result.ErrorMessage)
		}
		return fmt.Errorf("sms: %s", msg)
	}

	return nil
}
