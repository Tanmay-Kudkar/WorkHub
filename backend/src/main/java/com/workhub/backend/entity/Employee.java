package com.workhub.backend.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "employees")
public class Employee {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Column(nullable = false)
  private String firstName;

  @NotBlank
  @Column(nullable = false)
  private String lastName;

  @Email
  @NotBlank
  @Column(nullable = false, unique = true)
  private String email;

  private String phone;

  @Column(length = 5)
  private String phoneCountryCode = "+1";

  @Column(name = "department_id")
  private Long departmentId;

  @Column(name = "job_title_id")
  private Long jobTitleId;

  @Transient
  private String departmentName;

  @Transient
  private String jobTitleName;

  // Retained as a lightweight profile field; detailed address lives in
  // employee_addresses.
  private String address;

  private BigDecimal salary;

  @Column(length = 3)
  private String currency = "USD";

  private LocalDate dateOfBirth;

  private LocalDate hireDate;

  @Column(nullable = false)
  private boolean active = true;

  @Column(nullable = false)
  private String role = "USER"; // USER or ADMIN

  @Column(name = "profile_image", columnDefinition = "TEXT")
  private String profileImage;

  @Transient
  @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
  private String password;

  @JsonIgnore
  @Column(name = "password_hash")
  private String passwordHash;

  @Column(name = "last_login_at")
  private Instant lastLoginAt;

  @PrePersist
  @PreUpdate
  private void normalize() {
    if (this.email != null)
      this.email = this.email.trim().toLowerCase();
    if (this.firstName != null)
      this.firstName = this.firstName.trim();
    if (this.lastName != null)
      this.lastName = this.lastName.trim();
    if (this.phone != null)
      this.phone = this.phone.trim();
    if (this.address != null)
      this.address = this.address.trim();
    if (this.phoneCountryCode != null)
      this.phoneCountryCode = this.phoneCountryCode.trim();
    if (this.currency != null)
      this.currency = this.currency.trim().toUpperCase();
    if (this.role == null || this.role.isBlank())
      this.role = "USER";
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getPhoneCountryCode() {
    return phoneCountryCode;
  }

  public void setPhoneCountryCode(String phoneCountryCode) {
    this.phoneCountryCode = phoneCountryCode;
  }

  public Long getDepartmentId() {
    return departmentId;
  }

  public void setDepartmentId(Long departmentId) {
    this.departmentId = departmentId;
  }

  public Long getJobTitleId() {
    return jobTitleId;
  }

  public void setJobTitleId(Long jobTitleId) {
    this.jobTitleId = jobTitleId;
  }

  public String getDepartmentName() {
    return departmentName;
  }

  public void setDepartmentName(String departmentName) {
    this.departmentName = departmentName;
  }

  public String getAddress() {
    return address;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public LocalDate getDateOfBirth() {
    return dateOfBirth;
  }

  public void setDateOfBirth(LocalDate dateOfBirth) {
    this.dateOfBirth = dateOfBirth;
  }

  public String getJobTitleName() {
    return jobTitleName;
  }

  public void setJobTitleName(String jobTitleName) {
    this.jobTitleName = jobTitleName;
  }

  // Backward-compatible aliases for existing frontend components.
  @Transient
  public String getDepartment() {
    return departmentName;
  }

  public void setDepartment(String department) {
    this.departmentName = department;
  }

  @Transient
  public String getPosition() {
    return jobTitleName;
  }

  public void setPosition(String position) {
    this.jobTitleName = position;
  }

  public BigDecimal getSalary() {
    return salary;
  }

  public void setSalary(BigDecimal salary) {
    this.salary = salary;
  }

  public String getCurrency() {
    return currency;
  }

  public void setCurrency(String currency) {
    this.currency = currency;
  }

  public LocalDate getHireDate() {
    return hireDate;
  }

  public void setHireDate(LocalDate hireDate) {
    this.hireDate = hireDate;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getProfileImage() {
    return profileImage;
  }

  public void setProfileImage(String profileImage) {
    this.profileImage = profileImage;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public Instant getLastLoginAt() {
    return lastLoginAt;
  }

  public void setLastLoginAt(Instant lastLoginAt) {
    this.lastLoginAt = lastLoginAt;
  }
}
