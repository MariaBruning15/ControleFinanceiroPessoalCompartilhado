package com.ifpr.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Habilita o @Scheduled usado no heartbeat das conexões SSE. */
@Configuration
@EnableScheduling
public class AgendamentoConfig {
}
