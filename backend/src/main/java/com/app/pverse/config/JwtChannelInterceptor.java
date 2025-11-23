package com.app.pverse.config;

import com.app.pverse.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            StompCommand command = accessor.getCommand();
            System.out.println("📨 WebSocket message intercepted - Command: " + command);

            if (StompCommand.CONNECT.equals(command)) {
                System.out.println("🔐 WebSocket CONNECT - Authenticating...");

                String authHeader = accessor.getFirstNativeHeader("Authorization");
                System.out.println("   Authorization header: " + (authHeader != null ? "Present" : "Missing"));

                if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);

                    try {
                        if (tokenProvider.validateToken(token)) {
                            String username = tokenProvider.getUsernameFromToken(token);
                            Long userId = tokenProvider.getUserIdFromToken(token);

                            System.out.println("   ✅ Token valid for user: " + username + " (ID: " + userId + ")");

                            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                            UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            accessor.setUser(authentication);

                            System.out.println("   ✅ Authentication set in SecurityContext and WebSocket session");
                        } else {
                            System.out.println("   ❌ Token validation failed");
                        }
                    } catch (Exception e) {
                        System.out.println("   ❌ Error during token validation: " + e.getMessage());
                        e.printStackTrace();
                    }
                } else {
                    System.out.println("   ⚠️ No valid Authorization header");
                }
            } else if (StompCommand.SEND.equals(command)) {
                System.out.println("📤 SEND command - Destination: " + accessor.getDestination());
                System.out.println("   User: " + (accessor.getUser() != null ? accessor.getUser().getName() : "null"));
                System.out.println("   Message payload: " + new String((byte[]) message.getPayload()));
            } else if (StompCommand.SUBSCRIBE.equals(command)) {
                System.out.println("📡 SUBSCRIBE command - Destination: " + accessor.getDestination());
            }
        }

        return message;
    }
}

