// Package socket provides a WebSocket broadcast hub.
// Clients connect to /ws (auth-protected) and are placed in:
//   - a per-user room  → hub.Emit(userID, event, data)
//   - a per-role room  → hub.BroadcastToRole("admin", event, data)
//   - the global room  → hub.Broadcast(event, data)
package socket

import (
	"encoding/json"
	"log"
	"sync"
)

// Message is the envelope sent over the WebSocket wire.
type Message struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}

// Hub manages all active WebSocket connections.
type Hub struct {
	mu     sync.RWMutex
	users  map[uint]map[*Client]bool   // userID  → clients
	roles  map[string]map[*Client]bool // role    → clients  (e.g. "admin")
	all    map[*Client]bool            // every connected client
	emitCh chan emitMsg
}

type emitMsg struct {
	userID *uint   // set → emit to one user's room
	role   *string // set → broadcast to all clients of this role
	// both nil → broadcast to everyone
	msg []byte
}

// NewHub creates a Hub ready to Run.
func NewHub() *Hub {
	return &Hub{
		users:  make(map[uint]map[*Client]bool),
		roles:  make(map[string]map[*Client]bool),
		all:    make(map[*Client]bool),
		emitCh: make(chan emitMsg, 256),
	}
}

// Run delivers emitted events. Call as: go hub.Run()
//
// Register/unregister happen synchronously under the lock rather than via
// channels: with two channels an instant disconnect could be processed before
// its register, re-adding a client whose send channel was already closed, and
// the next emit would panic on that closed channel.
func (h *Hub) Run() {
	for m := range h.emitCh {
		h.mu.RLock()
		var targets map[*Client]bool
		switch {
		case m.userID != nil:
			targets = h.users[*m.userID]
		case m.role != nil:
			targets = h.roles[*m.role]
		default:
			targets = h.all
		}
		for c := range targets {
			select {
			case c.send <- m.msg:
			default: // slow client — drop
			}
		}
		h.mu.RUnlock()
	}
}

// Emit sends event+data to all connections belonging to userID.
func (h *Hub) Emit(userID uint, event string, data interface{}) {
	h.send(emitMsg{userID: &userID, msg: h.marshal(event, data)})
}

// BroadcastToRole sends event+data to all connected clients with the given role.
// e.g. hub.BroadcastToRole("admin", "user_signup", payload)
func (h *Hub) BroadcastToRole(role, event string, data interface{}) {
	h.send(emitMsg{role: &role, msg: h.marshal(event, data)})
}

// Broadcast sends event+data to every connected client.
func (h *Hub) Broadcast(event string, data interface{}) {
	h.send(emitMsg{msg: h.marshal(event, data)})
}

func (h *Hub) register(c *Client) {
	h.mu.Lock()
	h.all[c] = true
	// user room
	if h.users[c.userID] == nil {
		h.users[c.userID] = make(map[*Client]bool)
	}
	h.users[c.userID][c] = true
	// role room
	if h.roles[c.role] == nil {
		h.roles[c.role] = make(map[*Client]bool)
	}
	h.roles[c.role][c] = true
	total := len(h.all)
	h.mu.Unlock()
	log.Printf("socket: connected userID=%d role=%s total=%d", c.userID, c.role, total)
}

func (h *Hub) unregister(c *Client) {
	h.mu.Lock()
	if !h.all[c] {
		h.mu.Unlock()
		return // already removed — never close send twice
	}
	delete(h.all, c)
	if room := h.users[c.userID]; room != nil {
		delete(room, c)
		if len(room) == 0 {
			delete(h.users, c.userID)
		}
	}
	if room := h.roles[c.role]; room != nil {
		delete(room, c)
		if len(room) == 0 {
			delete(h.roles, c.role)
		}
	}
	// Closed under the write lock, so Run (which sends under the read lock) can't race it
	close(c.send)
	total := len(h.all)
	h.mu.Unlock()
	log.Printf("socket: disconnected userID=%d role=%s total=%d", c.userID, c.role, total)
}

func (h *Hub) marshal(event string, data interface{}) []byte {
	raw, err := json.Marshal(Message{Event: event, Data: data})
	if err != nil {
		log.Printf("socket: marshal error: %v", err)
		return nil
	}
	return raw
}

func (h *Hub) send(m emitMsg) {
	if m.msg == nil {
		return
	}
	select {
	case h.emitCh <- m:
	default:
		// Never block an HTTP handler on a backed-up hub
		log.Printf("socket: emit queue full — dropping event")
	}
}
