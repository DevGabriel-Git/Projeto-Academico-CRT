package com.crt.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import jakarta.validation.constraints.*;
import lombok.NoArgsConstructor;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank @Size(max = 120)
    private String nome;
    @NotBlank @Email @Size(max = 254)
    private String email;
    @NotBlank @Pattern(regexp = "[0-9]{11}")
    private String cpf;
    @NotBlank @Size(min = 12, max = 72)
    private String senha;
}
