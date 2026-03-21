package razorpay

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
)

const apiBase = "https://api.razorpay.com/v1"

// CreateOrder creates a Razorpay order and returns the order ID.
// amount must be in the smallest currency unit (paise for INR).
func CreateOrder(keyID, keySecret string, amountPaise int64, receipt string) (string, error) {
	payload := map[string]interface{}{
		"amount":   amountPaise,
		"currency": "INR",
		"receipt":  receipt,
	}
	body, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", apiBase+"/orders", bytes.NewBuffer(body))
	if err != nil {
		return "", err
	}
	req.SetBasicAuth(keyID, keySecret)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		errMsg, _ := json.Marshal(result)
		return "", fmt.Errorf("razorpay API error: %s", string(errMsg))
	}

	orderID, ok := result["id"].(string)
	if !ok || orderID == "" {
		return "", fmt.Errorf("invalid response from Razorpay: missing order id")
	}
	return orderID, nil
}

// VerifySignature validates the Razorpay webhook/payment signature using HMAC-SHA256.
func VerifySignature(keySecret, razorpayOrderID, razorpayPaymentID, razorpaySignature string) bool {
	mac := hmac.New(sha256.New, []byte(keySecret))
	mac.Write([]byte(razorpayOrderID + "|" + razorpayPaymentID))
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(razorpaySignature))
}
