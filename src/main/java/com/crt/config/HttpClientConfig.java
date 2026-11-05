package com.crt.config;

import org.springframework.context.annotation.*;

import org.springframework.http.client.SimpleClientHttpRequestFactory;

import org.springframework.web.client.RestTemplate;

@Configuration

public class HttpClientConfig {

    @Bean

    public RestTemplate restTemplate() {

        var factory = new SimpleClientHttpRequestFactory();

        factory.setConnectTimeout(3000);

        factory.setReadTimeout(5000);

        return new RestTemplate(factory);

    }

}
