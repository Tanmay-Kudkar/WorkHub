# Experiment No. 10 — White Box Testing

## Aim

To develop test cases for the Employee Management case study using White Box Testing.

## Selected Module

- **Module:** Employee Management
- **File:** `src/components/EmployeeForm.jsx`
- **Selected Method:** `onSubmit()`

## Reason for Selection

The `onSubmit()` method contains four explicit decision points:

1. New employee password requirement.
2. Whether the password field is empty and should be removed from the payload.
3. Create employee versus update employee.
4. Whether the save animation must wait until 800 ms.

These decisions make the method suitable for Control Flow Graph construction, Cyclomatic Complexity calculation, basis-path identification, and White Box test design.

## 1. Source Code Under Test

```javascript
const onSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setError(null);
  try {
    const startTime = Date.now();

    const payload = {
      ...form,
      departmentId:
        form.departmentId === "" ? null : Number(form.departmentId),
      jobTitleId: form.jobTitleId === "" ? null : Number(form.jobTitleId),
      salary: form.salary === "" ? null : Number(form.salary),
      currency: form.currency || "USD",
    };

    if (!form.id && !form.password)
      throw new Error("Password is required for new employees");

    if (!form.password) delete payload.password;

    if (form.id) {
      await updateEmployee(form.id, payload, currentUser);
    } else {
      await createEmployee(payload);
    }

    const elapsedTime = Date.now() - startTime;
    const minSaveTime = 800;

    if (elapsedTime < minSaveTime) {
      await new Promise((resolve) =>
        setTimeout(resolve, minSaveTime - elapsedTime)
      );
    }

    setForm(empty);
    onSaved && onSaved();
  } catch (e) {
    setError(e.message);
  } finally {
    setSaving(false);
  }
};
```

**Source:** `src/components/EmployeeForm.jsx`, `onSubmit()`.

## Study the Code and Identify Decisions

### D1 — New Employee Password

```javascript
if (!form.id && !form.password)
```

Branches:

- **True:** New employee has no password → throw an error.
- **False:** Continue.

### D2 — Password Field

```javascript
if (!form.password)
```

Branches:

- **True:** Remove `payload.password`.
- **False:** Keep the password in the payload.

### D3 — Create or Update

```javascript
if (form.id)
```

Branches:

- **True:** Call `updateEmployee()`.
- **False:** Call `createEmployee()`.

### D4 — Minimum Save Animation Time

```javascript
if (elapsedTime < minSaveTime)
```

Branches:

- **True:** Wait until 800 ms.
- **False:** Continue immediately.

There are no explicit loops in the selected method.

> **Note:** The CFG below models the main decision flow. The `catch` and `finally` blocks are exception/finalization handling and are kept outside the four-decision basis-path calculation.

## 2. Logical Blocks / Nodes

| Node | Logical Block |
|---:|---|
| 1 | Start / submit event |
| 2 | Set saving state and prepare payload |
| 3 | Check new employee password requirement |
| 4 | Throw password-required error |
| 5 | Check whether password is empty |
| 6 | Remove password from payload |
| 7 | Check whether employee ID exists |
| 8 | Update existing employee |
| 9 | Create new employee |
| 10 | Check elapsed time < 800 ms |
| 11 | Wait for remaining save-animation time |
| 12 | Reset form and call `onSaved` |
| 13 | End / successful normal flow |

## 3. Control Flow Graph

```text
                 ┌─────────────┐
                 │  1 Start    │
                 └──────┬──────┘
                        │
                        v
              ┌──────────────────┐
              │ 2 Prepare       │
              │    payload       │
              └────────┬─────────┘
                       │
                       v
                 ┌────────────┐
                 │ D1: New    │
                 │ password?  │
                 └───┬────┬───┘
                   T │    │ F
                     v    v
              ┌────────┐ ┌────────────┐
              │4 Throw │ │D2: Password│
              │ error  │ │   empty?   │
              └────┬───┘ └──┬────┬────┘
                   │       T │    │ F
                   │         v    │
                   │      ┌──────┐ │
                   │      │6 Del.│ │
                   │      │pass. │ │
                   │      └──┬───┘ │
                   │         │     │
                   │         └──┬──┘
                   │            v
                   │       ┌────────────┐
                   │       │D3: form.id?│
                   │       └──┬────┬────┘
                   │        T │    │ F
                   │          v    v
                   │      ┌─────┐ ┌──────┐
                   │      │8    │ │9     │
                   │      │Update│ │Create│
                   │      └──┬──┘ └──┬───┘
                   │         └──┬────┘
                   │            v
                   │       ┌──────────────┐
                   │       │D4: elapsed   │
                   │       │time < 800ms? │
                   │       └──┬──────┬────┘
                   │        T │      │ F
                   │          v      │
                   │      ┌───────┐  │
                   │      │11 Wait│  │
                   │      └───┬───┘  │
                   │          └──┬───┘
                   │             v
                   │       ┌────────────┐
                   │       │12 Reset +  │
                   │       │   onSaved  │
                   │       └─────┬──────┘
                   │             v
                   │       ┌─────────┐
                   │       │13 End   │
                   │       └─────────┘
                   │
                   v
             Exception path
```

## 4. Cyclomatic Complexity

### Method 1 — Decision Nodes

Formula:

```text
V(G) = Number of Decision Nodes + 1
```

Decision nodes:

- D1 — Password requirement
- D2 — Password empty
- D3 — Employee ID exists
- D4 — Elapsed time < 800 ms

Therefore:

```text
V(G) = 4 + 1 = 5
```

**Cyclomatic Complexity = 5**

### Method 2 — Edges and Nodes

For the main normal-flow CFG:

- `N = 13` nodes
- `E = 16` edges
- `P = 1` connected component

Formula:

```text
V(G) = E − N + 2P
V(G) = 16 − 13 + 2(1)
V(G) = 5
```

Therefore, the selected method has **5 linearly independent basis paths**.

## 5. Independent / Basis Paths

| Path ID | Node Sequence | Description |
|---|---|---|
| P1 | `1 → 2 → 3 → 4` | New employee without password → password error |
| P2 | `1 → 2 → 3 → 5 → 6 → 7 → 8 → 10 → 12 → 13` | Existing employee with blank password → remove password → update |
| P3 | `1 → 2 → 3 → 5 → 7 → 8 → 10 → 12 → 13` | Existing employee with password → update |
| P4 | `1 → 2 → 3 → 5 → 7 → 9 → 10 → 11 → 12 → 13` | New employee with password → create → wait |
| P5 | `1 → 2 → 3 → 5 → 7 → 9 → 10 → 12 → 13` | New employee with password → create → no wait |

## 6. White Box Test Cases

| ID | Employee ID | Password | Elapsed Time | Operation | Path |
|---|---|---|---|---|---|
| WB-01 | Empty | Empty | N/A | Reject new employee | P1 |
| WB-02 | 101 | Empty | < 800 ms | Update existing employee without password | P2 |
| WB-03 | 101 | `Pass1234` | >= 800 ms | Update existing employee with password | P3 |
| WB-04 | Empty | `Pass1234` | < 800 ms | Create new employee and wait | P4 |
| WB-05 | Empty | `Pass1234` | >= 800 ms | Create new employee without extra wait | P5 |

### Expected Results

#### WB-01

A new employee has no password.

→ Password is required for new employees.

#### WB-02

An existing employee has no password.

→ `payload.password` is removed.

→ `updateEmployee()` is called.

#### WB-03

An existing employee has a password.

→ The password remains in the payload.

→ `updateEmployee()` is called.

#### WB-04

A new employee has a password and saving completes in less than 800 ms.

→ `createEmployee()` is called.

→ The method waits for the remaining time to reach the minimum save-animation duration.

→ The form is reset and `onSaved()` is called.

#### WB-05

A new employee has a password and elapsed time is already at least 800 ms.

→ `createEmployee()` is called.

→ No additional wait is required.

→ The form is reset and `onSaved()` is called.

## 7. Test Execution Results

The ZIP contains the frontend implementation, but it does not contain a complete executable backend/test environment or recorded runtime results. Therefore, actual Pass/Fail execution results cannot be claimed from the ZIP alone.

The following is the expected-result matrix derived from the source code:

| Test ID | Expected Result | Runtime Status |
|---|---|---|
| WB-01 | Password-required error is raised | Requires execution |
| WB-02 | Password removed and employee updated | Requires execution |
| WB-03 | Employee updated with password | Requires execution |
| WB-04 | Employee created and minimum 800 ms delay applied | Requires execution |
| WB-05 | Employee created without additional wait | Requires execution |

## 8. Statement Coverage

The five designed paths cover the main statements in the selected method:

- Submit event handling
- Saving-state initialization
- Payload construction
- New-employee password validation
- Password removal
- Employee update
- Employee creation
- Elapsed-time calculation
- Minimum 800 ms delay
- Form reset
- `onSaved()` callback

The four decisions are exercised through their relevant true/false branches across the basis paths.

## 9. Branch Coverage

| Decision | True Branch | False Branch |
|---|---|---|
| D1 — New employee without password | WB-01 | WB-02 to WB-05 |
| D2 — Password empty | WB-02 | WB-03 to WB-05 |
| D3 — Employee ID exists | WB-02, WB-03 | WB-04, WB-05 |
| D4 — Elapsed time < 800 ms | WB-04 | WB-05 and WB-02/WB-03 depending on runtime |

The basis-path design targets both branches of all four explicit decisions.

## 10. Defect Documentation

No defect should be declared from this static inspection alone.

The ZIP provides source code, while actual API/database behavior and runtime execution depend on the application environment. Runtime defects should be recorded only after executing the test cases.

## Conclusion

White Box Test Cases were developed for the Employee Management application's `EmployeeForm.jsx` `onSubmit()` method. The internal control flow was analyzed, four explicit decision points were identified, a Control Flow Graph was constructed, and Cyclomatic Complexity was calculated as **5**. Five independent basis paths were designed with corresponding test cases covering password validation, password handling, employee creation/update, and the 800 ms save-animation condition.

This analysis is based on the uploaded project ZIP and follows the structure of the supplied White Box Testing experiment template.
