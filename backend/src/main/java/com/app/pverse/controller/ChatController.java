package com.app.pverse.controller;

import com.app.pverse.dto.MessageDTO;
import com.app.pverse.entity.Message;
import com.app.pverse.entity.Conversation;
import com.app.pverse.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    // --- WebSocket endpoint ---
    @MessageMapping("/chat.send")
    public void handleChat(@Payload MessageDTO dto) {
        try {
            System.out.println("\n=== WebSocket Message Received ===");
            System.out.println("Thread: " + Thread.currentThread().getName());
            System.out.println("Full DTO: " + dto);

            if (dto == null) {
                System.out.println("❌ ERROR: DTO is null");
                return;
            }

            if (dto.getSenderId() == null || dto.getReceiverId() == null) {
                System.out.println("❌ ERROR: Invalid DTO - missing IDs");
                System.out.println("   SenderId: " + dto.getSenderId());
                System.out.println("   ReceiverId: " + dto.getReceiverId());
                return;
            }

            System.out.println("Sender ID: " + dto.getSenderId());
            System.out.println("Receiver ID: " + dto.getReceiverId());
            System.out.println("Content: " + dto.getContent());
            System.out.println("MessageType: " + dto.getMessageType());

            System.out.println("🔄 Calling messageService.sendMessage...");
            Message saved = messageService.sendMessage(dto.getSenderId(), dto.getReceiverId(),
                    dto.getContent(), dto.getMessageType());

            if (saved == null || saved.getId() == null) {
                System.out.println("❌ ERROR: Message was not saved to database!");
                return;
            }

            System.out.println("✅ Message saved to DB with ID: " + saved.getId());
            System.out.println("   Conversation ID: " + saved.getConversation().getId());
            System.out.println("   Created At: " + saved.getCreatedAt());

            MessageDTO response = MessageDTO.fromEntity(saved);
            System.out.println("📦 Response DTO created:");
            System.out.println("   ID: " + response.getId());
            System.out.println("   Conversation ID: " + response.getConversationId());
            System.out.println("   Sender ID: " + response.getSenderId());
            System.out.println("   Receiver ID: " + response.getReceiverId());

            System.out.println("📤 Broadcasting to receiver: /topic/chat/" + dto.getReceiverId());
            messagingTemplate.convertAndSend("/topic/chat/" + dto.getReceiverId(), response);
            System.out.println("✅ Broadcasted to receiver");

            System.out.println("📤 Broadcasting to sender: /topic/chat/" + dto.getSenderId());
            messagingTemplate.convertAndSend("/topic/chat/" + dto.getSenderId(), response);
            System.out.println("✅ Broadcasted to sender");

            System.out.println("=== Message Processing Complete ===\n");
        } catch (IllegalStateException e) {
            System.out.println("❌ ERROR: IllegalStateException - " + e.getMessage());
            System.out.println("   This usually means users are not friends");
            e.printStackTrace();
        } catch (IllegalArgumentException e) {
            System.out.println("❌ ERROR: IllegalArgumentException - " + e.getMessage());
            System.out.println("   This usually means invalid IDs or user not found");
            e.printStackTrace();
        } catch (Exception e) {
            System.out.println("❌ ERROR: Unexpected exception during message processing");
            System.out.println("   Exception type: " + e.getClass().getName());
            System.out.println("   Exception message: " + e.getMessage());
            System.out.println("   Stack trace:");
            e.printStackTrace();
        }
    }

    // --- TEST WebSocket endpoint ---
    @MessageMapping("/chat.test")
    public void testWebSocket(@Payload String message) {
        System.out.println("\n🧪 TEST WebSocket Message Received: " + message);
        messagingTemplate.convertAndSend("/topic/test", "Echo: " + message);
        System.out.println("✅ Test message broadcasted\n");
    }

    // --- REST endpoints ---

    @GetMapping("/api/chat/{conversationId}/messages")
    public ResponseEntity<Page<MessageDTO>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<Message> messages = messageService.getMessages(conversationId, page, size);
        Page<MessageDTO> response = messages.map(MessageDTO::fromEntity);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/api/chat/read/{conversationId}/{userId}")
    @ResponseBody
    public void markRead(@PathVariable Long conversationId, @PathVariable Long userId) {
        messageService.markMessagesAsRead(conversationId, userId);
    }

    @GetMapping("/api/chat/conversations/{userId}")
    public ResponseEntity<List<Conversation>> getUserConversations(@PathVariable Long userId) {
        List<Conversation> conversations = messageService.getUserConversations(userId);
        return ResponseEntity.ok(conversations);
    }
}
