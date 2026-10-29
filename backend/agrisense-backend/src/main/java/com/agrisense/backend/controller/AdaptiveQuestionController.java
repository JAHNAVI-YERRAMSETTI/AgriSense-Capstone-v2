package com.agrisense.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.agrisense.backend.model.AdaptiveQuestion;
import com.agrisense.backend.service.AdaptiveQuestionService;

@RestController
@RequestMapping("/adaptivequestionapi")
@CrossOrigin(origins = "*")
public class AdaptiveQuestionController {

    private final AdaptiveQuestionService
            adaptiveQuestionService;

    public AdaptiveQuestionController(
            AdaptiveQuestionService adaptiveQuestionService
    ) {
        this.adaptiveQuestionService =
                adaptiveQuestionService;
    }

    @PostMapping("/add")
    public ResponseEntity<AdaptiveQuestion> addQuestion(
            @RequestBody AdaptiveQuestion question
    ) {
        return ResponseEntity.ok(
                adaptiveQuestionService.addQuestion(question)
        );
    }

    @GetMapping("/viewall")
    public ResponseEntity<List<AdaptiveQuestion>>
            getAllActiveQuestions() {

        return ResponseEntity.ok(
                adaptiveQuestionService
                        .getAllActiveQuestions()
        );
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<AdaptiveQuestion> getQuestionById(
            @PathVariable Long id
    ) {

        AdaptiveQuestion question =
                adaptiveQuestionService
                        .getQuestionById(id);

        if (question == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(question);
    }

    @GetMapping("/field/{relatedField}")
    public ResponseEntity<List<AdaptiveQuestion>>
            getQuestionsByField(
                    @PathVariable String relatedField
            ) {

        return ResponseEntity.ok(
                adaptiveQuestionService
                        .getQuestionsByField(relatedField)
        );
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<AdaptiveQuestion>>
            getQuestionsByCategory(
                    @PathVariable String category
            ) {

        return ResponseEntity.ok(
                adaptiveQuestionService
                        .getQuestionsByCategory(category)
        );
    }
}