# Contract: publish a lab

`POST /labs/{labId}/publish`

This contract follows LeeTKOB FAQ-01 (class ownership) and FAQ-12 (publication). The class brief takes precedence if either source changes.

## Purpose and state transition

Publish every student's final score for one lab after human review. On the first successful call, the lab changes atomically from `ready` to `published`, the server records who published it and when, and students may see their scores and confirmed deductions. There is no unpublish operation. Later per-submission score corrections must include a reason and preserve the old score in an audit log; that correction is outside this endpoint.

## Authentication and authorization

- The caller must send `Authorization: Bearer <token>` and be authenticated as a TA.
- The TA must be assigned to the class that owns the lab.
- A lab outside the TA's classes is indistinguishable from a nonexistent lab and returns `lab-not-found` (`404`) to prevent identifier enumeration.
- Admin and student roles cannot call this endpoint.

The PA#2 harness uses deterministic development tokens in the form `Bearer ta:<userId>`. These are test credentials, not production authentication.

## Path parameters

| Name    | Type   | Rules                                      |
| ------- | ------ | ------------------------------------------ |
| `labId` | string | Required; a stable, opaque lab identifier. |

The request has no body.

## Preconditions

The first publication succeeds only when all are true:

1. The server's current time is at or after the lab submission deadline.
2. Every item in the human review queue has a TA decision. This includes every `violation`, every `unsure`, and the random 10% sample of `pass` verdicts.

## Success response

Status: `200 OK`  
Content-Type: `application/json`

```json
{
  "labId": "lab-merge-sort",
  "status": "published",
  "publishedAt": "2026-11-10T12:00:00.000Z",
  "publishedBy": "ta-a"
}
```

| Field         | Type   | Rules                                                       |
| ------------- | ------ | ----------------------------------------------------------- |
| `labId`       | string | The requested lab identifier.                               |
| `status`      | string | Always `published`.                                         |
| `publishedAt` | string | UTC RFC 3339 timestamp of the first successful publication. |
| `publishedBy` | string | Stable identifier of the TA who first published.            |

## Idempotency and concurrency

The operation is naturally idempotent and does not require an `Idempotency-Key`. Repeating the request for an already published lab returns `200` with the original `publishedAt` and `publishedBy`; it creates no second publication event and sends no duplicate notification. Competing valid calls are serialized: exactly one call performs the state transition and all successful callers observe the same audit fields.

## Error model

Every error uses RFC 9457 Problem Details with Content-Type `application/problem+json`:

```json
{
  "type": "https://leetkob.example/problems/reviews-pending",
  "title": "Reviews pending",
  "status": 409,
  "detail": "Every queued violation, unsure verdict, and sampled pass needs a TA decision.",
  "instance": "/labs/lab-merge-sort/publish",
  "pendingReviewCount": 3
}
```

`type`, `title`, `status`, `detail`, and `instance` are always present. `instance` is the request path. Clients must ignore unknown extension fields.

| Problem type suffix               | Status | When                                                                                                |
| --------------------------------- | -----: | --------------------------------------------------------------------------------------------------- |
| `authentication-required`         |    401 | Token is missing, malformed, expired, or invalid.                                                   |
| `ta-role-required`                |    403 | Caller is authenticated but is not a TA.                                                            |
| `lab-not-found`                   |    404 | Lab does not exist or belongs to a class not assigned to this TA.                                   |
| `submission-deadline-not-reached` |    409 | Server time is before the submission deadline.                                                      |
| `reviews-pending`                 |    409 | At least one required human-review decision is missing. Includes integer `pendingReviewCount >= 1`. |

Authorization is checked before lab visibility and state, so an unauthorized caller never learns whether the lab exists, its deadline, or its queue state.

## Observable effects

After a first successful response:

- the lab is permanently marked published;
- confirmed deductions and final scores become visible to each owning student;
- an audit record contains the lab, TA, and timestamp;
- one publication notification may be queued for each affected student.

The HTTP success response means the publication state was committed. Notification delivery may complete asynchronously and does not roll the publication back.
