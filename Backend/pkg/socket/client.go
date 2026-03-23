package socket

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait  = 10 * time.Second
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
	maxMsgSize = 512
)

// Client represents one WebSocket connection.
type Client struct {
	hub    *Hub
	userID uint
	role   string
	conn   *websocket.Conn
	send   chan []byte
}

// NewClient creates a client and registers it with the hub.
func NewClient(hub *Hub, userID uint, role string, conn *websocket.Conn) *Client {
	c := &Client{
		hub:    hub,
		userID: userID,
		role:   role,
		conn:   conn,
		send:   make(chan []byte, 64),
	}
	hub.register(c)
	return c
}

// ReadPump reads incoming messages (ping/pong keep-alive).
// Must be called in a goroutine. Unregisters on disconnect.
func (c *Client) ReadPump() {
	defer func() {
		c.hub.unregister(c)
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMsgSize)
	_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		return c.conn.SetReadDeadline(time.Now().Add(pongWait))
	})

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err,
				websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("socket: read error userID=%d: %v", c.userID, err)
			}
			break
		}
	}
}

// WritePump drains the send channel and writes messages to the WebSocket.
// Must be called in a goroutine.
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.send:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// Hub closed the channel
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}

		case <-ticker.C:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
