package handlers

import (
	"net/http"
	"slices"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"Backend/pkg/socket"
	"Backend/pkg/utils"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Browsers don't apply CORS to WebSocket upgrades, so check Origin here.
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		if origin == "" {
			return true // non-browser client; still needs a valid token
		}
		return slices.Contains(utils.AllowedOrigins(), origin)
	},
}

// WsHandler upgrades HTTP connections to WebSocket and registers them with the hub.
type WsHandler struct {
	hub *socket.Hub
}

func NewWsHandler(hub *socket.Hub) *WsHandler {
	return &WsHandler{hub: hub}
}

// ServeWS upgrades the request to a WebSocket connection.
// The caller must be authenticated (AuthMiddleware sets userID in context).
//
// GET /ws
func (h *WsHandler) ServeWS(c *gin.Context) {
	userIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	roleRaw, _ := c.Get("role")
	role, _ := roleRaw.(string)

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return // upgrader already wrote the error response
	}

	client := socket.NewClient(h.hub, userIDRaw.(uint), role, conn)
	go client.WritePump()
	go client.ReadPump()
}
