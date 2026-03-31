package com.workhub.backend.repository;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class MasterDataRepository {

  private final JdbcTemplate jdbcTemplate;

  public MasterDataRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<Map<String, Object>> listDepartments() {
    return jdbcTemplate.queryForList("SELECT id, name FROM departments ORDER BY name");
  }

  public List<Map<String, Object>> listJobTitles() {
    return jdbcTemplate.queryForList("SELECT id, title FROM job_titles ORDER BY title");
  }
}
