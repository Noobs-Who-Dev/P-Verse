package com.app.pverse.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtChannelInterceptor jwtChannelInterceptor;
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        System.out.println("🔌 Registering STOMP endpoint: /ws");
        registry.addEndpoint("/ws") // endpoint để client connect
                .setAllowedOriginPatterns("*")
                .withSockJS();
        System.out.println("✅ STOMP endpoint registered successfully");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        System.out.println("📡 Configuring message broker...");
        // /app -> nơi client gửi tin nhắn lên server
        // /topic -> nơi server broadcast lại
        // /user -> user-specific messages
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic", "/user", "/queue");
        registry.setUserDestinationPrefix("/user");
        System.out.println("✅ Message broker configured:");
        System.out.println("   - Application prefix: /app");
        System.out.println("   - Broker prefixes: /topic, /user, /queue");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        System.out.println("🔐 Registering JWT channel interceptor...");
        registration.interceptors(jwtChannelInterceptor);
        System.out.println("✅ JWT channel interceptor registered");
    }
}
