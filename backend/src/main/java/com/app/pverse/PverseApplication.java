package com.app.pverse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PverseApplication {

	public static void main(String[] args) {
		SpringApplication.run(PverseApplication.class, args);
	}

} 