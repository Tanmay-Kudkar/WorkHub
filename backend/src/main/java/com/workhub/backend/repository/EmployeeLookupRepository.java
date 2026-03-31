package com.workhub.backend.repository;

import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class EmployeeLookupRepository {

  private final JdbcTemplate jdbcTemplate;

  public EmployeeLookupRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public Map<Long, String> departmentsById() {
    return jdbcTemplate.query(
        "SELECT id, name FROM departments",
        rs -> {
          Map<Long, String> result = new java.util.HashMap<>();
          while (rs.next()) {
            result.put(rs.getLong("id"), rs.getString("name"));
          }
          return result;
        });
  }

  public Map<Long, String> jobTitlesById() {
    return jdbcTemplate.query(
        "SELECT id, title FROM job_titles",
        rs -> {
          Map<Long, String> result = new java.util.HashMap<>();
          while (rs.next()) {
            result.put(rs.getLong("id"), rs.getString("title"));
          }
          return result;
        });
  }
}
