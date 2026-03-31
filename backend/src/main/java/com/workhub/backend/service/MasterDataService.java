package com.workhub.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.workhub.backend.repository.MasterDataRepository;

@Service
public class MasterDataService {

  private final MasterDataRepository masterDataRepository;

  public MasterDataService(MasterDataRepository masterDataRepository) {
    this.masterDataRepository = masterDataRepository;
  }

  public List<Map<String, Object>> listDepartments() {
    return masterDataRepository.listDepartments();
  }

  public List<Map<String, Object>> listJobTitles() {
    return masterDataRepository.listJobTitles();
  }
}
