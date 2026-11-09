package com.crt.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    @NotBlank
    @Size(max = 254)
    private String login; // Pode ser email ou cpf

    @NotBlank
    @Size(max = 72)
    private String senha;
}
