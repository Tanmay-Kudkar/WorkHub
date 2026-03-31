package com.workhub.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workhub.backend.service.MasterDataService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MasterDataController {

  private final MasterDataService masterDataService;

  public MasterDataController(MasterDataService masterDataService) {
    this.masterDataService = masterDataService;
  }

  @GetMapping("/departments")
  public ResponseEntity<List<Map<String, Object>>> listDepartments() {
    return ResponseEntity.ok(masterDataService.listDepartments());
  }

  @GetMapping("/job-titles")
  public ResponseEntity<List<Map<String, Object>>> listJobTitles() {
    return ResponseEntity.ok(masterDataService.listJobTitles());
  }
}
