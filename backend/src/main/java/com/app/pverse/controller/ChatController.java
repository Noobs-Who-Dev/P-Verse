package com.app.pverse.controller;

import com.app.pverse.dto.MessageDTO;
import com.app.pverse.entity.Message;
import com.app.pverse.services.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    // --- WebSocket endpoint ---
    @MessageMapping("/chat.send")
    public void handleChat(@Payload MessageDTO dto) {
        if (dto == null || dto.getSenderId() == null || dto.getReceiverId() == null) return;

        Message saved = messageService.sendMessage(dto.getSenderId(), dto.getReceiverId(),
                dto.getContent(), dto.getMessageType());

        MessageDTO response = MessageDTO.fromEntity(saved);


        messagingTemplate.convertAndSend("/topic/chat/" + dto.getReceiverId(), response);
        messagingTemplate.convertAndSend("/topic/chat/" + dto.getSenderId(), response);
    }

    // --- REST endpoints ---

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<Page<MessageDTO>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<Message> messages = messageService.getMessages(conversationId, page, size);
        Page<MessageDTO> response = messages.map(MessageDTO::fromEntity);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/read/{conversationId}/{userId}")
    @ResponseBody
    public void markRead(@PathVariable Long conversationId, @PathVariable Long userId) {
        messageService.markMessagesAsRead(conversationId, userId);
    }
}
