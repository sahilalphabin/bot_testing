

# **Chatbot Testing**

Sub header

***Table of Contents***

[**1\. Header1	2](#header1)**

[Header 2	2](#header-2)

[Header 3	2](#header-3)

[**NOTE	3**](#note)

[**Performance Testing Estimation	4**](#performance-testing-estimation)

# 

1. # **Header1** {#header1}

## **Header 2** {#header-2}

### Header 3 {#header-3}

1. **CREDITOR TESTING**  
   1. ***Upload “ADD NEW ACCOUNTS”***  
      1. 1, 3 and 10 concurrent creditor users using Manual upload process  
      2. 1, 3 and 10 concurrent creditor users using SFTP Upload process  
      3. 10k, 25k, 50k,100k,250k,500k, 1M

 

2. ***Upload “ADD NEW ACCOUNTS \+ CFPB TEMPLATE”***  
   1. 1, 3 and 10 concurrent creditor users using Manual upload process  
      2. 1, 3 and 10 concurrent creditor users using SFTP Upload process  
      3. 10k, 25k, 50k,100k,250k,500k, 1M  
      4. Download CFPB letters for each

2. **CONSUMER TESTING**  
   1. 1K, 5K, 10K, 25k consumer transacting concurrently  
   2. Across 1, 3 and 10 creditor accounts

**Tentative timeline: 10- 12 Full days (8 hours per day)**

## **NOTE** {#note}

**General Testing Considerations:**

* The estimate is based on **expected conditions** but may change if **unexpected system behavior** arises.  
* **Test execution timelines** may be impacted by **delays in environment setup, access credentials, or API limitations**.  
* Any **third-party dependencies** (APIs, integrations, cloud services) could introduce **unforeseen failures** affecting test execution.

**Load Testing Considerations:**

* Load testing results might be affected by **server scaling policies**, which could change response times dynamically.  
* **Caching layers and CDNs** might impact test accuracy, requiring **bypass mechanisms**.  
* Network fluctuations and **cloud infrastructure scaling** may affect test repeatability.  
* **Peak load simulation** may need multiple test iterations for accurate results.  
* We may face **429 Too Many Requests** errors may occur, requiring adjustments to request pacing.

**Security Testing Considerations:**

* Some security mechanisms (e.g., **WAF, IDS, bot detection**) might **flag penetration tests**, requiring **whitelisting or alternate approaches**.  
* **Rate-limiting protections** may prevent multiple attack scenarios from executing as expected.  
* Testing **authentication mechanisms** might need manual verification of **session expiration and token handling**.  
* **Legal or compliance approvals** may be required before running certain **aggressive security tests**. However this should be fine as we still didn’t release.

**This estimation does not include any details about Functional Testing or Automated UI Testing.**

* Any **functional test coverage, UI automation scripts, or front-end validation checks** are out of scope for this estimation.  
* If needed, a **separate estimate** should be provided for **functional and automated UI testing efforts**.

# **Performance Testing Estimation** {#performance-testing-estimation}

| Module | Sub-Module / Feature | Task | Estimated Time | User Load Testing (5K / 50K / 500K / 1M Users) |
| :---- | :---- | :---- | :---- | :---- |
| User Registration & Login | \- | Sign up and log in with different user roles (merchant, consumer) | 2 weeks | 2h / 6h / 12h / 24h |
| Onboarding Process | \- | Enter company details, configure settings, and complete onboarding steps | 0.5 week | 2h / 6h / 12h / 24h |

