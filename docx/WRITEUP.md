# CTF Writeup: FinTrust Bank Security Audit

**Challenge Name**: FinTrust Financial Audit
**Difficulty**: Easy/Medium
**Objectives**: Gain unauthorized access to the Admin Panel and retrieve the system flag.

## Discovery phase

The landing page of FinTrust Bank presents a professional and "secure" banking facade. However, a standard security audit reveals common implementation flaws.

### 1. The Transparent API
After logging in, the application loads transaction data dynamically. By monitoring the **Network Tab**, we identified that the application fetches data based on an explicit query parameter (`account=guest`).

### 2. Exploiting HPP
Testing the `/transactions` endpoint for **HTTP Parameter Pollution** revealed that the server-side logic (Node/Express) handles multiple parameters by using the last value provided in the query string.
- **Exploit URL**: `/transactions?account=guest&&account=admin`
- **Impact**: The server bypassed the session context of the `guest` user and returned the `admin` account's transaction history. This leaked a reference to a hidden administration path: `/admin/vital`.

### 3. Spoofing the Mobile client
The `/admin/vital` endpoint was restricted to "FinTrust Mobile" clients. The 403 error message provided a cryptographic hint: `RmlubW9iaWxlMS41`.
- **Decoding**: The string decoded to `Finmobile1.5`.
- **Bypass**: Using Chrome DevTools "Network Conditions," we spoofed our User-Agent to match this string. The server, trusting the header, granted access to the Mobile Admin Panel.

## Conclusion

The "FinTrust" system suffered from three critical pillars of insecurity:
1.  **Weak Parameter Validation** (Susceptibility to HPP).
2.  **Header-Based Access Control** (Trusting client-supplied metadata).

**Flag Captured**: `flag{Que_sera_Sera}`
