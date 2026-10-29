package com.agrisense.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agrisense.backend.dto.ConstraintValidationRequest;
import com.agrisense.backend.dto.ConstraintValidationResponse;
import com.agrisense.backend.service.ConstraintValidationService;

@RestController
@RequestMapping("/constraintapi")
@CrossOrigin(origins = "*")
public class ConstraintValidationController {

    private final ConstraintValidationService
            constraintValidationService;

    public ConstraintValidationController(
            ConstraintValidationService
                    constraintValidationService) {

        this.constraintValidationService =
                constraintValidationService;
    }

    @PostMapping("/validate")
    public ResponseEntity<ConstraintValidationResponse>
            validateAction(
                    @RequestBody
                    ConstraintValidationRequest request) {

        ConstraintValidationResponse response =
                constraintValidationService
                        .validateAction(request);

        if (!response.isSuccess()) {

            return new ResponseEntity<>(
                    response,
                    HttpStatus.NOT_FOUND
            );
        }

        return ResponseEntity.ok(response);
    }
}