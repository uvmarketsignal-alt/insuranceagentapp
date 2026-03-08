import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, FileText, ShieldCheck, HelpCircle, Car, Heart,
  Home, Plane, ChevronDown, ChevronUp, Star, Eye, Clock, Tag,
  Activity, Users, AlertCircle, CheckCircle, Info,
  Zap, Shield, Phone, MessageSquare, X,
  ThumbsUp, ThumbsDown, Share2, Printer, Download, PlusCircle
} from 'lucide-react';
import { useStore } from '../store';

// ─── COMPREHENSIVE KNOWLEDGE BASE DATA ─────────────────────────────────────────
const KNOWLEDGE_DATA = [
  // ── MOTOR INSURANCE ────────────────────────────────────────────────────────
  {
    id: 'kb_motor_001',
    category: 'Motor Insurance',
    icon: '🚗',
    color: 'blue',
    title: 'What is Motor Insurance and why is it mandatory?',
    content: `Motor insurance is a policy that provides financial protection against physical damage or bodily injury resulting from road accidents and against liability that could also arise from incidents in a vehicle.

WHY IT IS MANDATORY:
Under the Motor Vehicles Act, 1988, third-party motor insurance is COMPULSORY for all vehicles plying on Indian roads. Driving without valid insurance is a punishable offense with:
• Fine of ₹2,000 for first offense
• Fine of ₹4,000 for second offense
• Community service or imprisonment up to 3 months

TYPES OF MOTOR INSURANCE:
1. Third Party (TP) Insurance
   • Mandatory by law
   • Covers damage/injury to third parties only
   • Does NOT cover your own vehicle damage
   • Premiums are regulated by IRDAI
   • Sum Assured is set as IDV (Insured Declared Value)

2. Comprehensive Insurance
   • Covers third-party liability PLUS own damage
   • Protects against theft, fire, natural calamities
   • Includes personal accident cover
   • Higher premium but wider coverage

3. Own Damage (OD) Insurance
   • Covers only your own vehicle damage
   • Must be combined with TP policy
   • Covers accidents, theft, natural disasters

REQUIRED DOCUMENTS:
• RC Book (Registration Certificate)
• Previous policy copy
• Aadhaar Card / PAN Card
• Driving License
• Vehicle inspection report (for renewal)`,
    tags: 'motor, vehicle, third party, comprehensive, own damage, mandatory, RC book',
    faqs: [
      { q: 'What is IDV in motor insurance?', a: 'IDV (Insured Declared Value) is the current market value of your vehicle. It is the maximum amount your insurer will pay in case of total loss or theft. IDV = (Manufacturer\'s listed price - Depreciation) + Accessories value. For Third Party insurance, the sum assured is automatically set to IDV.' },
      { q: 'What is No Claim Bonus (NCB)?', a: 'NCB is a discount on your Own Damage premium for every claim-free year. It ranges from 20% (1 year) to 50% (5+ consecutive years). NCB is transferable when you change insurer but is lost when you file a claim.' },
      { q: 'Does motor insurance cover natural disasters?', a: 'Yes, comprehensive motor insurance covers STFI (Storm, Tempest, Flood, Inundation) and RSMD (Riot, Strike, Malicious Damage) as standard add-ons. Third-party only policies do NOT cover this.' },
      { q: 'What documents are needed for motor insurance claim?', a: 'You need: Duly filled claim form, Original policy document, RC Book, Driving License, FIR (for theft/major accidents), Repair bills/estimates, Photographs of damage.' },
      { q: 'What is the difference between bumper-to-bumper and comprehensive?', a: 'Bumper-to-bumper (Zero Depreciation) is an add-on to comprehensive insurance that eliminates depreciation deduction during claims. In regular comprehensive, depreciation is deducted from claim settlement. Zero Dep is recommended for new vehicles up to 5 years old.' }
    ]
  },
  {
    id: 'kb_motor_002',
    category: 'Motor Insurance',
    icon: '🚗',
    color: 'blue',
    title: 'Motor Insurance Premium Calculation & IDV Explained',
    content: `PREMIUM CALCULATION FORMULA:
Motor insurance premium = Own Damage Premium + Third Party Premium + Add-ons - NCB Discount

OWN DAMAGE PREMIUM:
OD Premium = IDV × Premium Rate (based on vehicle age & CC)

Vehicle Age    | Premium Rate (approx.)
Up to 1 year   | 3.127% of IDV
1-2 years      | 3.127% of IDV  
2-3 years      | 3.252% of IDV
3-5 years      | 3.187% of IDV
5-10 years     | 3.427% of IDV
10+ years      | 3.527% of IDV

IDV CALCULATION:
IDV = Listed Price × (1 - Depreciation %)

Vehicle Age    | Depreciation %
Up to 6 months | 5%
6m - 1 year    | 15%
1-2 years      | 20%
2-3 years      | 30%
3-4 years      | 40%
4-5 years      | 50%
5+ years       | By mutual agreement

THIRD PARTY PREMIUM (IRDAI Fixed Rates 2024):
Vehicle Type        | Annual TP Premium
2W up to 75cc       | ₹538
2W 75-150cc         | ₹714
2W 150-350cc        | ₹1,366
2W above 350cc      | ₹2,804
Private Car <1000cc | ₹2,094
Private Car 1000-1500cc | ₹3,416
Private Car >1500cc | ₹7,897`,
    tags: 'IDV, premium, calculation, depreciation, third party rates, NCB',
    faqs: [
      { q: 'Can I choose my own IDV?', a: 'Yes, within a range of ±25% of the calculated IDV. Choosing lower IDV reduces premium but also reduces claim settlement. Choosing higher IDV increases premium but gives better coverage.' },
      { q: 'What add-ons should I buy for new car?', a: 'For a new car (0-3 years): Zero Depreciation (highly recommended), Engine Protection, Return to Invoice, Roadside Assistance, Consumables Cover. For older cars: Engine Protection, Roadside Assistance are most valuable.' }
    ]
  },

  // ── HEALTH INSURANCE ────────────────────────────────────────────────────────
  {
    id: 'kb_health_001',
    category: 'Health Insurance',
    icon: '❤️',
    color: 'red',
    title: 'Complete Guide to Health Insurance in India',
    content: `Health insurance is a type of insurance coverage that pays for medical expenses incurred due to illness, injury, or surgery.

TYPES OF HEALTH INSURANCE:
1. Individual Health Insurance
   • Covers one person only
   • Higher premium per person but specific coverage
   • Best for young individuals with no dependents

2. Family Floater Plan
   • Single sum assured shared by entire family
   • Cost-effective for families
   • Sum assured available to any family member
   • Typically covers self + spouse + 2 children

3. Senior Citizen Health Insurance
   • For persons above 60 years
   • Higher premiums due to health risks
   • Pre-existing diseases covered after waiting period
   • Specialized plans for heart, diabetes patients

4. Critical Illness Insurance
   • Lump sum payment on diagnosis of listed illness
   • Covers: Cancer, Heart Attack, Stroke, Kidney failure, etc.
   • Separate from regular health insurance
   • 30-day survival period clause applies

KEY TERMS YOU MUST KNOW:
• Sum Insured: Maximum coverage amount per year
• Waiting Period: Period before coverage starts (3-4 years for pre-existing)
• Co-payment: Your share of medical bill (0-20%)
• Deductible: Fixed amount you pay before insurance kicks in
• Network Hospital: Cashless treatment available
• Room Rent Limit: Max room rent covered per day

HEALTH METRICS FOR UNDERWRITING:
• Height & Weight (BMI calculation):
  - BMI < 18.5: Underweight (moderate risk)
  - BMI 18.5-24.9: Normal (standard rates)
  - BMI 25-29.9: Overweight (10-15% loading)
  - BMI 30-34.9: Obese Class I (20-30% loading)
  - BMI ≥ 35: Obese Class II/III (40-50% loading or rejection)
• Blood Group: Important for emergency matching
• Smoker/Non-smoker: Smokers pay 20-30% higher premium`,
    tags: 'health insurance, family floater, critical illness, cashless, network hospital, BMI, pre-existing',
    faqs: [
      { q: 'What is the waiting period for pre-existing diseases?', a: 'Most health insurers have a 2-4 year waiting period for pre-existing conditions. After this period, the condition is covered. For diabetes, hypertension, and asthma, some specialized plans have shorter waiting periods of 1-2 years.' },
      { q: 'How is health insurance premium calculated?', a: 'Premium depends on: Age (older = higher), Sum Insured, BMI/health status, Smoker/Non-smoker, City (metro = higher), No. of family members covered, Add-ons selected. Formula: Base Premium × Age Factor × BMI Loading × Smoker Loading × City Factor' },
      { q: 'What is cashless hospitalization?', a: 'In cashless hospitalization, the insurer directly settles the bill with the network hospital. You only pay non-covered expenses. For this: 1) Get admitted to a network hospital, 2) Show insurance card/policy, 3) Hospital sends pre-authorization request, 4) Insurer approves, 5) Discharge without payment.' },
      { q: 'What documents are required for health insurance enrollment?', a: 'Required: Completed proposal form, Age proof (Aadhaar/Birth Certificate), Identity proof (Aadhaar/PAN), Address proof, Photograph, Medical reports (if age >45 or sum insured >₹10L), Blood group report.' },
      { q: 'Can I port my health insurance to another company?', a: 'Yes! IRDAI allows portability. Benefits retained during porting: Waiting period credit, NCB, Pre-existing disease waiting period already completed. You must apply 45 days before renewal. New insurer cannot deny portability request.' }
    ]
  },

  // ── LIFE INSURANCE ─────────────────────────────────────────────────────────
  {
    id: 'kb_life_001',
    category: 'Life Insurance',
    icon: '🛡️',
    color: 'green',
    title: 'Life Insurance: Types, Benefits & How to Choose',
    content: `Life insurance is a contract between an insurer and policyholder where the insurer guarantees payment of a death benefit to named beneficiaries upon the insured's death.

TYPES OF LIFE INSURANCE:
1. Term Life Insurance
   • Pure protection plan
   • Low premium, high sum assured
   • No maturity benefit (pure risk cover)
   • Best for income replacement
   • Recommended: 10-15x annual income

2. Whole Life Insurance
   • Coverage for entire life (up to age 99/100)
   • Builds cash value over time
   • Higher premiums than term
   • Surrender value available

3. Endowment Plan
   • Combination of insurance + savings
   • Pays sum assured on death OR maturity
   • Lower returns than pure investment
   • Suitable for goal-based savings

4. Unit-Linked Insurance Plan (ULIP)
   • Insurance + Market-linked investment
   • Returns depend on fund performance
   • 5-year lock-in period
   • Switch between funds allowed

5. Money Back Plan
   • Regular payouts during policy term
   • Percentage of sum assured at intervals
   • Final lump sum on maturity
   • Best for regular cash flow needs

LIFE INSURANCE - KEY CONCEPTS:
• Sum Assured: The guaranteed death benefit
• Nominee: Person who receives the death benefit
• Premium Payment Term: How long you pay premium
• Policy Term: Duration of coverage
• Surrender Value: Amount received if policy cancelled
• Loan Against Policy: Available after 3 years

DOCUMENTS REQUIRED:
• Aadhaar Card (mandatory)
• PAN Card (mandatory for sum assured >₹50,000)
• Age proof
• Income proof (salary slips, ITR)
• Medical examination reports
• Nominee details with proof of relationship`,
    tags: 'life insurance, term, endowment, ULIP, money back, nominee, death benefit',
    faqs: [
      { q: 'How much life insurance do I need?', a: 'Standard rule: 10-15 times your annual income. More precisely: (Outstanding loans + Annual income × Years to retirement + Future goals like children\'s education) - (Existing investments + Current insurance). Example: Annual income ₹5L, loans ₹10L, 25 years to retire = Need ₹135L (₹1.35Cr) minimum.' },
      { q: 'What is the free look period?', a: 'After receiving the policy, you have 15 days (30 days for distance marketing) to review it. If unsatisfied, return the policy for full refund minus medical examination costs and stamp duty. This is called the Free Look Period.' },
      { q: 'What is nomination in life insurance?', a: 'Nomination designates a person to receive the sum assured upon the policyholder\'s death. Key rules: Must be immediate family member, Multiple nominees allowed with percentage split, Change nomination anytime during policy term, Update nomination after marriage/divorce/death of nominee.' },
      { q: 'Does life insurance cover death due to suicide?', a: 'For policies issued after 2022: Suicide within 1 year of policy issue → 80% of premiums paid returned. After 1 year → Full sum assured paid. This changed from older "no suicide cover" rule. Always verify the specific policy wording.' }
    ]
  },

  // ── TERM INSURANCE ────────────────────────────────────────────────────────
  {
    id: 'kb_term_001',
    category: 'Term Insurance',
    icon: '📋',
    color: 'purple',
    title: 'Term Insurance: Maximum Protection at Minimum Cost',
    content: `Term insurance is the simplest, most affordable form of life insurance that provides a high sum assured at low premiums for a specific term period.

WHY TERM INSURANCE IS IMPORTANT:
• Provides income replacement for family
• Covers home loans and other liabilities
• Low cost → High coverage
• Tax benefits under Section 80C & 10(10D)

TERM INSURANCE RIDERS (ADD-ONS):
1. Accidental Death Benefit (ADB)
   • Additional payout if death due to accident
   • Usually 100% of base sum assured additionally

2. Critical Illness Rider
   • Lump sum on diagnosis of critical illness
   • 36+ illnesses covered (cancer, heart attack, etc.)
   • Premium waived after critical illness diagnosis

3. Waiver of Premium
   • Future premiums waived on disability/critical illness
   • Policy continues in force
   • Most important rider for working professionals

4. Terminal Illness Benefit
   • 50% of sum assured paid on terminal illness diagnosis
   • Remaining 50% paid to nominee after death
   
5. Return of Premium (ROP)
   • All premiums returned at policy maturity
   • 30-50% higher premium than regular term
   • Zero risk option - get money back if you survive

TERM INSURANCE PREMIUM FACTORS:
• Age at entry (lower age = lower premium)
• Sum assured amount
• Policy term (longer term = higher premium)
• Smoker/Non-smoker (smokers pay 50-80% more)
• Gender (women pay 10-15% less)
• Health history and BMI
• Occupation (high-risk occupations pay more)

HEALTH REQUIREMENTS:
• Height, Weight & BMI calculation
• Blood pressure, Blood sugar
• Blood group and complete blood count
• ECG (for age >35 or sum assured >₹1Cr)
• Chest X-ray (for smokers)`,
    tags: 'term insurance, riders, return of premium, critical illness, waiver of premium, sum assured',
    faqs: [
      { q: 'What is the best age to buy term insurance?', a: 'The earlier, the better! At 25 years: ₹1 Cr coverage costs ₹6,000-8,000/year. At 35 years: Same coverage costs ₹12,000-15,000/year. At 45 years: ₹25,000-35,000/year. Buying early saves lakhs over the policy term and is easier to get approved.' },
      { q: 'How long should my term insurance term be?', a: 'Rule of thumb: Cover until age 60-65 (retirement). Minimum: Until your youngest child becomes financially independent (usually age 25). Also consider: Until your home loan is repaid. Example: If you\'re 30 now, choose 30-35 year term.' },
      { q: 'What happens if I miss a premium payment?', a: 'Grace period: 30 days for annual/half-yearly, 15 days for monthly. During grace period: Policy is active, death claims are payable. After grace period: Policy lapses. Reinstatement: Possible within 2-5 years by paying all dues with interest + health declaration.' }
    ]
  },

  // ── HOME INSURANCE ─────────────────────────────────────────────────────────
  {
    id: 'kb_home_001',
    category: 'Home Insurance',
    icon: '🏠',
    color: 'orange',
    title: 'Home Insurance: Protect Your Most Valuable Asset',
    content: `Home insurance (property insurance) protects your home structure and its contents against various risks like fire, theft, natural disasters, and accidental damage.

WHAT DOES HOME INSURANCE COVER?

STRUCTURE (Building) COVERAGE:
• Damage due to fire, lightning, explosion
• Natural disasters: Flood, earthquake, storm, cyclone
• Riots, strike, malicious damage
• Aircraft damage
• Missile testing operations
• Subsidence and landslide
• Burst/overflow of water tanks and pipes
• NOT covered: Wear & tear, nuclear perils, war

CONTENTS COVERAGE:
• Furniture, fixtures, appliances
• Clothing and personal belongings
• Electronics (TV, refrigerator, AC, etc.)
• Jewelry (up to specified limit)
• Documents and cash (limited)

ADDITIONAL COVERAGES:
• Rent for alternate accommodation (while house is repaired)
• Public liability (injury to visitor)
• Tenant's liability
• Workmen's compensation (domestic workers)

TYPES OF HOME INSURANCE:
1. Building Only: Just the structure
2. Contents Only: Just belongings (for renters)
3. Building + Contents: Comprehensive protection

HOME INSURANCE VALUATION:
• Building: Reinstatement value (cost to rebuild, NOT market value)
  Formula: Built-up area (sq ft) × Construction cost per sq ft
  Example: 1000 sq ft × ₹1,500/sq ft = ₹15,00,000 sum insured
• Contents: Sum of all items' current market value

REQUIRED INFORMATION:
• Property address and type
• Year of construction
• Built-up area in sq ft
• Floor number (for apartments)
• Type of construction (RCC/brick)
• Ownership type (owned/rented/mortgaged)`,
    tags: 'home insurance, property, fire, flood, contents, building, earthquake',
    faqs: [
      { q: 'Is home insurance mandatory?', a: 'Home insurance is NOT mandatory by Indian law. However, if you have taken a home loan, most banks require you to have at least fire insurance for the property as a condition of the loan. It is highly recommended given increasing natural disaster risks.' },
      { q: 'Should I insure at market value or construction cost?', a: 'Always insure at REINSTATEMENT VALUE (construction cost to rebuild), NOT market value. Market value includes land, which cannot be damaged. If you over-insure: You pay extra premium with no benefit. If you under-insure: You receive proportionally less in claims (average clause applies).' },
      { q: 'Does home insurance cover home loans if I die?', a: 'Regular home insurance does NOT cover your home loan liability. For that, you need a Home Loan Protection Plan (HLPP) or Term Insurance with sum assured equal to or greater than your outstanding loan amount.' }
    ]
  },

  // ── TRAVEL INSURANCE ──────────────────────────────────────────────────────
  {
    id: 'kb_travel_001',
    category: 'Travel Insurance',
    icon: '✈️',
    color: 'cyan',
    title: 'Travel Insurance: Complete Coverage for Every Journey',
    content: `Travel insurance provides financial protection against unexpected events during domestic or international travel.

WHAT DOES TRAVEL INSURANCE COVER?

MEDICAL COVERAGE:
• Emergency medical expenses (hospitalization, surgery)
• Medical evacuation (air ambulance if needed)
• Repatriation of mortal remains
• Dental emergency treatment
• Pre-existing conditions (limited, 24-48 hr emergency only)

TRAVEL RELATED:
• Trip cancellation / interruption
• Flight delay compensation (>6 hours)
• Missed connection coverage
• Baggage loss, delay, or damage
• Passport and document loss
• Personal liability abroad

TYPES OF TRAVEL PLANS:
1. Individual Travel Policy: Single traveller
2. Family Travel Policy: Entire family, single trip
3. Student Travel Insurance: For studying abroad
4. Senior Citizen Travel: Age 60-80 special plans
5. Schengen Visa Travel Insurance: Mandatory for EU visa
6. Annual Multi-Trip: Multiple trips in a year (best value)

IMPORTANT TERMS:
• Trip Duration: Max days covered per trip
• Sum Insured: Medical coverage amount (should be ≥$50,000 for USA/Europe)
• Pre-existing Conditions: Usually not covered except acute emergencies
• Adventure Sports: Excluded unless specifically added
• Alcohol/Drug related: Never covered

REQUIRED INFORMATION:
• Travel destination country
• Travel start and return dates
• Passport number and expiry
• Number of travellers and ages
• Purpose of travel (business/leisure/student)
• Any pre-existing medical conditions

DOCUMENTS FOR CLAIM:
• Filled claim form
• Original bills and receipts
• Medical reports and prescriptions
• Airline tickets and boarding passes
• Police report (for theft)
• Baggage loss receipt from airline (PIR)`,
    tags: 'travel insurance, international, medical evacuation, trip cancellation, baggage, passport loss, Schengen',
    faqs: [
      { q: 'How much medical coverage should I get for international travel?', a: 'Recommended minimums: USA/Canada: $100,000+ (medical costs very high), Europe/Schengen: €30,000 minimum (Schengen visa requires this), Other countries: $50,000 minimum. For seniors or pre-existing conditions, always go higher.' },
      { q: 'When should I buy travel insurance?', a: 'Buy as soon as you book your trip (not just before departure). This ensures: Trip cancellation coverage from day of purchase, Pre-trip medical emergency coverage, Maximum protection period. Buying last-minute limits your coverage benefits.' },
      { q: 'Does travel insurance cover COVID-19?', a: 'Most current travel policies DO cover COVID-19 related emergencies including: Medical treatment abroad if you get COVID, Trip cancellation if you test positive before departure, Quarantine hotel costs (some policies). Check for specific COVID clause in your policy.' }
    ]
  },

  // ── GENERAL INSURANCE CONCEPTS ─────────────────────────────────────────────
  {
    id: 'kb_general_001',
    category: 'Insurance Basics',
    icon: '📚',
    color: 'indigo',
    title: 'Insurance Fundamentals Every Agent Must Know',
    content: `CORE INSURANCE PRINCIPLES:

1. PRINCIPLE OF UTMOST GOOD FAITH (Uberrimae Fidei)
   • Both insurer and insured must disclose all material facts
   • Non-disclosure can void the policy
   • Examples of material facts: health conditions, previous claims, business nature

2. PRINCIPLE OF INSURABLE INTEREST
   • The insured must have a financial stake in the subject matter
   • Life insurance: You have insurable interest in yourself, spouse, children, business partners
   • Property insurance: Interest at time of loss

3. PRINCIPLE OF INDEMNITY
   • Insurance restores you to the same financial position
   • You cannot profit from insurance
   • Applies to: General insurance (NOT life insurance)
   • Market value, not replacement value (unless specified)

4. PRINCIPLE OF SUBROGATION
   • After paying claim, insurer gets your right to sue third party
   • Example: Car accident caused by third party → insurer pays you → insurer sues third party
   • Applies to general insurance only

5. PRINCIPLE OF CONTRIBUTION
   • When you have multiple policies, all contribute to claim proportionally
   • You cannot claim more than actual loss
   • Each insurer pays: (Sum Insured with them / Total Sum Insured) × Actual Loss

6. PRINCIPLE OF PROXIMATE CAUSE
   • The nearest/immediate cause determines claim payability
   • Example: Earthquake → fire → house burns → earthquake is proximate cause

IRDAI (Insurance Regulatory and Development Authority of India):
• Regulates all insurance business in India
• Sets premium rates for motor TP insurance
• Defines standard policy wordings
• Handles consumer grievances
• Mandates insurance ombudsman for disputes
• Oversees solvency margins of insurers`,
    tags: 'insurance principles, IRDAI, insurable interest, indemnity, subrogation, utmost good faith',
    faqs: [
      { q: 'What is the Insurance Ombudsman?', a: 'The Insurance Ombudsman is a free dispute resolution mechanism for policyholders. You can approach for: Claims disputes, Premium overcharging, Policy servicing issues. Maximum claim: ₹30 lakhs. Process: File with company → Escalate to Ombudsman if unsatisfied. Decision binding on insurer, not on complainant.' },
      { q: 'What are the tax benefits of insurance?', a: 'Section 80C: Premium paid for life insurance deductible up to ₹1.5L per year. Section 80D: Health insurance premium deductible (₹25,000 self/family, additional ₹25,000-₹50,000 for parents). Section 10(10D): Maturity amount from life insurance exempt from tax. NPS/Pension plans: Additional ₹50,000 under 80CCD.' }
    ]
  },

  // ── CLAIMS PROCESS ─────────────────────────────────────────────────────────
  {
    id: 'kb_claims_001',
    category: 'Claims Process',
    icon: '📝',
    color: 'yellow',
    title: 'How to File and Track Insurance Claims',
    content: `CLAIMS PROCESS - STEP BY STEP:

MOTOR INSURANCE CLAIM:
Step 1: Intimate insurer immediately (golden hour rule - within 24 hours)
Step 2: Register FIR if third party involved or vehicle stolen
Step 3: Do NOT move vehicle until surveyor inspection (for major damage)
Step 4: Submit claim form with: RC Book, Driving License, Policy copy, FIR copy, Repair estimate
Step 5: Surveyor visits within 24-48 hours for inspection
Step 6: Vehicle sent to network garage for cashless repair OR you can choose own garage (reimbursement)
Step 7: Insurance pays garage directly (cashless) OR reimburses you (reimbursement within 7 days)

HEALTH INSURANCE CLAIM:
CASHLESS:
→ Hospitalization at network hospital → Show E-card/Policy → Hospital files pre-auth → Insurer approves → Get treated → Discharge with zero payment (except non-covered items)

REIMBURSEMENT:
→ Get treated at any hospital → Pay all bills → Collect all original bills, reports, prescriptions → Submit claim within 30 days of discharge → Insurer reviews → Payment in 15-30 days

LIFE INSURANCE DEATH CLAIM:
Step 1: Intimate insurer (nominee should do this)
Step 2: Submit: Claim form, Original policy, Death certificate, KYC of nominee (Aadhaar, PAN, bank details), Medical records (for natural death)
Step 3: For accidental death: Add FIR, post-mortem report
Step 4: Insurer investigates (early claims within 3 years are investigated more)
Step 5: Claim settled within 30 days of receiving all documents

CLAIM REJECTION REASONS (AVOID THESE):
• Non-disclosure of pre-existing conditions
• Drunk driving (motor claims)
• Policy lapse at time of incident
• Exclusion clause not checked
• Late intimation beyond allowed time
• Wrong documents submitted
• Misrepresentation in proposal form`,
    tags: 'claims, process, cashless, reimbursement, death claim, motor claim, documents',
    faqs: [
      { q: 'How long does an insurance claim take to settle?', a: 'By IRDAI regulations: Motor claims: 7 days after survey. Health cashless: Pre-authorization within 1 hour (emergency) to 3 hours (planned). Health reimbursement: 30 days after all documents received. Life claims: 30 days after all documents received. Delay: You can charge interest on delayed claims.' },
      { q: 'What if my claim is rejected unfairly?', a: 'If claim is wrongly rejected: Step 1: Write to Grievance Officer of the insurance company. Step 2: If no response in 30 days, approach Insurance Ombudsman. Step 3: Approach Consumer Court or Civil Court. Step 4: IRDAI complaint portal (igms.irda.gov.in). Time limit: Complaint within 1 year of final rejection.' }
    ]
  },

  // ── RENEWALS & LAPSE ──────────────────────────────────────────────────────
  {
    id: 'kb_renewal_001',
    category: 'Policy Management',
    icon: '🔄',
    color: 'teal',
    title: 'Policy Renewal, Lapse & Reinstatement Guide',
    content: `POLICY RENEWAL - BEST PRACTICES:

RENEWAL TIMELINE:
• 60 days before: Check policy, compare alternatives
• 30 days before: Send renewal notice to customer
• 15 days before: Follow up call/WhatsApp
• On due date: Ensure premium received
• 30 days after (grace period): Final chance

GRACE PERIOD BY POLICY TYPE:
• Motor Insurance: None (immediate lapse)
• Health Insurance: 30 days
• Life Insurance (annual): 30 days
• Life Insurance (monthly): 15 days
• Term Insurance: 30 days

CONSEQUENCES OF POLICY LAPSE:
Motor:
• No coverage from day of expiry
• Traffic fine ₹2,000-₹4,000
• NCB lost completely
• Need fresh inspection for renewal after 90 days

Health:
• Coverage stops immediately after grace period
• Waiting period may restart on reinstatement
• Pre-existing disease coverage may be affected
• No benefit credit for completed years

Life/Term:
• Death benefit not paid if policy lapsed
• Surrender value may be available
• Reinstatement requires health re-declaration
• Backdated premium payment with interest

REINSTATEMENT PROCESS:
Step 1: Submit reinstatement request (within 2 years typically)
Step 2: Pay all due premiums + interest (8-18% per annum)
Step 3: Submit health declaration form
Step 4: Medical examination (for health change or high sum assured)
Step 5: Insurer approves/rejects based on current health status`,
    tags: 'renewal, lapse, reinstatement, grace period, NCB, premium due',
    faqs: [
      { q: 'What is the break-in period for motor insurance?', a: 'A break-in period occurs when motor insurance expires and is not renewed immediately. If gap ≤ 90 days: Renewal possible without fresh inspection (for comprehensive). If gap > 90 days: Fresh vehicle inspection required. NCB is lost for break-in period. Third-party component can be renewed anytime.' }
    ]
  },

  // ── COMPLIANCE ────────────────────────────────────────────────────────────
  {
    id: 'kb_compliance_001',
    category: 'Compliance',
    icon: '⚖️',
    color: 'slate',
    title: 'IRDAI Compliance & Agent Regulations',
    content: `IRDAI AGENT LICENSING:

LICENSE REQUIREMENTS:
• Minimum age: 18 years
• Minimum education: 10th standard
• Pre-licensing training: 50 hours (Life/General), 75 hours (Composite)
• Pass IRDAI licensing exam (IC-38 for agents)
• Appointment by licensed insurer

AGENT CODE OF CONDUCT:
• Cannot represent more than one insurer per class (life/non-life)
• Must disclose all material facts to client
• Cannot give rebate on premium
• Cannot misrepresent policy benefits
• Must maintain client confidentiality
• Renewal reminders are mandatory (recommended)

ANTI-MONEY LAUNDERING (AML):
• KYC mandatory for all customers:
  - Photo ID (Aadhaar mandatory for Indian residents)
  - Address proof
  - PAN for transactions >₹50,000
• Enhanced due diligence for high-value policies
• Suspicious transaction reporting

IRDAI REPORTING REQUIREMENTS:
• Monthly: New business statistics
• Quarterly: Claims settlement data
• Annually: Financial statements, audit reports
• On-demand: IRDAI inspection cooperation required

GRIEVANCE REDRESSAL:
• Internal ombudsman: Within 15 days
• IRDAI complaint portal: igms.irda.gov.in
• Insurance Ombudsman: 17 offices across India
• Consumer Forum: For amounts >₹30 lakhs

KEY IRDAI CIRCULARS (2024):
• Bima Sugam: Digital insurance marketplace
• Bima Vahak: Women insurance workers program
• 30-day claim settlement mandate
• Standard products: Arogya Sanjeevani, Saral Jeevan Bima`,
    tags: 'IRDAI, compliance, agent license, AML, KYC, code of conduct, grievance',
    faqs: [
      { q: 'What are the penalties for insurance mis-selling?', a: 'Penalties for agents found guilty of mis-selling: License cancellation, Monetary penalty up to ₹1 crore (for insurer), FIR under IPC section 420 (fraud), Civil liability for losses caused to customer. Always document customer consent and needs analysis.' }
    ]
  },

  // ── OTHER INSURANCE ───────────────────────────────────────────────────────
  {
    id: 'kb_others_001',
    category: 'Other Insurance',
    icon: '🔒',
    color: 'gray',
    title: 'Specialty Insurance: Cyber, Fire, Marine & More',
    content: `OTHER IMPORTANT INSURANCE TYPES:

FIRE & INDUSTRIAL INSURANCE:
• Covers buildings and contents against fire, lightning, explosion
• Standard Fire and Special Perils (SFSP) Policy
• Mandatory for: Commercial properties, Factories, Warehouses
• Includes: Riot, strike, earthquake extension (RSMD, STFI)
• Sum insured: Reinstatement value of property

MARINE INSURANCE:
• Covers goods in transit (inland and overseas)
• Types: Marine Cargo (goods), Marine Hull (vessels)
• Important for: Importers, exporters, transporters
• All Risk vs Restricted Cover options

CYBER INSURANCE:
• Growing importance in digital age
• Covers: Data breaches, Ransomware, Phishing losses
• Business interruption due to cyber attack
• Third-party liability for customer data breach
• Increasingly relevant for all businesses

COMMERCIAL GENERAL LIABILITY (CGL):
• Protects businesses from third-party claims
• Public liability, Product liability, Professional indemnity
• Required for: Exhibitions, Events, Contractors, Consultants

AGRICULTURAL INSURANCE:
• Pradhan Mantri Fasal Bima Yojana (PMFBY)
• For farmers against crop failure
• Government subsidized premiums
• Covers: Drought, Flood, Pest, Fire damage to crops

PROFESSIONAL INDEMNITY:
• For doctors, lawyers, CAs, architects, IT companies
• Covers claims from professional negligence
• Third-party bodily injury or property damage
• Defense costs included`,
    tags: 'fire insurance, marine, cyber, liability, commercial, agricultural, PMFBY',
    faqs: [
      { q: 'What is a floater policy in commercial insurance?', a: 'A floater policy covers stocks/goods at multiple locations under one policy. Instead of separate policies for each godown/location, one policy covers all locations with a single sum insured. More flexible and usually cheaper than individual location policies.' }
    ]
  },

  // ── AGENCY OPERATIONS ─────────────────────────────────────────────────────
  {
    id: 'kb_ops_001',
    category: 'Agency Operations',
    icon: '🏢',
    color: 'violet',
    title: 'UV Insurance Agency - Standard Operating Procedures',
    content: `UV INSURANCE AGENCY - INTERNAL GUIDE

CUSTOMER ONBOARDING PROCESS:
1. Initial Contact
   • Collect basic details (name, phone, email)
   • Understand insurance needs
   • Create lead in system (Leads module)

2. Needs Analysis
   • Assess current coverage gaps
   • Calculate required sum assured
   • Consider family situation and income

3. Product Recommendation
   • Select appropriate policy type
   • Compare 3 insurers minimum
   • Explain all terms and exclusions clearly
   • Document customer consent

4. Application Process
   • Enter customer details in New Customer wizard
   • Upload all required documents
   • Camera capture allowed for document upload
   • Submit for owner approval (employees)
   • Owner submissions are auto-approved

5. Policy Issuance
   • Follow up with insurer for policy copy
   • Upload policy document in system
   • Schedule renewal reminder (12 months advance)

APPROVAL WORKFLOW:
• Employee submits → Pending status
• Owner reviews in Approvals page
• Owner can: Approve / Reject / Request Changes
• Owner adds own customers → Auto-approved

DOCUMENT REQUIREMENTS BY POLICY:
Motor: RC Book + Aadhaar + PAN + Previous Policy (renewal)
Health: Aadhaar + PAN + Medical Reports (age >45)
Life/Term: Aadhaar + PAN + Income Proof + Medical
Home: Property papers + Aadhaar + PAN + Valuation report
Travel: Passport + Visa + Travel tickets + Aadhaar

KPI TARGETS:
• New customers per month: Min 10 per employee
• Renewal collection: >90% of due renewals
• Claim intimation: Within 24 hours of incident
• Policy delivery: Within 7 days of acceptance
• Customer satisfaction: >4.5/5 rating`,
    tags: 'agency, operations, SOP, onboarding, workflow, KPI, employee guide',
    faqs: [
      { q: 'How should I handle a customer who wants to cancel their policy?', a: 'Retention process: Step 1: Understand the reason (premium cost, service issue, no longer needed). Step 2: Offer solutions (premium reduction, product switch, payment mode change). Step 3: If still wants to cancel, process short-period premium return. Step 4: Log interaction in system. Note: For life policies, surrendering early means significant loss - always counsel properly.' },
      { q: 'What should I do when a customer calls about a claim?', a: 'Claim intimation process: 1) Note all details (policy number, date/time of incident, nature of loss), 2) Intimate the insurer immediately (give them our agency code), 3) Create claim entry in Claims module, 4) Guide customer on next steps and documents needed, 5) Follow up daily until claim settled, 6) Update claim status in system at each stage.' }
    ]
  }
];

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'Motor Insurance':     { color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: <Car className="w-5 h-5" /> },
  'Health Insurance':    { color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    icon: <Heart className="w-5 h-5" /> },
  'Life Insurance':      { color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  icon: <Shield className="w-5 h-5" /> },
  'Term Insurance':      { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: <FileText className="w-5 h-5" /> },
  'Home Insurance':      { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: <Home className="w-5 h-5" /> },
  'Travel Insurance':    { color: 'text-cyan-700',   bg: 'bg-cyan-50',   border: 'border-cyan-200',   icon: <Plane className="w-5 h-5" /> },
  'Insurance Basics':    { color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: <BookOpen className="w-5 h-5" /> },
  'Claims Process':      { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: <AlertCircle className="w-5 h-5" /> },
  'Policy Management':   { color: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-200',   icon: <Activity className="w-5 h-5" /> },
  'Compliance':          { color: 'text-slate-700',  bg: 'bg-slate-50',  border: 'border-slate-200',  icon: <ShieldCheck className="w-5 h-5" /> },
  'Other Insurance':     { color: 'text-gray-700',   bg: 'bg-gray-50',   border: 'border-gray-200',   icon: <Shield className="w-5 h-5" /> },
  'Agency Operations':   { color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', icon: <Users className="w-5 h-5" /> },
};

// ─── FAQ ACCORDION ────────────────────────────────────────────────────────────
function FaqItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-medium text-slate-800 pr-4">{faq.q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-blue-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 text-slate-600 leading-relaxed border-t border-slate-100 pt-3 whitespace-pre-line">
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ARTICLE DETAIL MODAL ─────────────────────────────────────────────────────
function ArticleModal({
  article,
  onClose,
}: {
  article: typeof KNOWLEDGE_DATA[0];
  onClose: () => void;
}) {
  const cfg = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG['Insurance Basics'];
  const [helpful, setHelpful] = useState<'up' | 'down' | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 ${cfg.bg} border-b ${cfg.border}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-white shadow-sm ${cfg.color}`}>
                {cfg.icon}
              </div>
              <div>
                <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>
                  {article.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{article.title}</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> 245 views</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5 min read</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> Featured</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/60 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {article.tags.split(',').slice(0, 5).map((tag) => (
              <span key={tag} className={`px-2 py-0.5 text-xs rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Main Content */}
          <div className="bg-slate-50 rounded-xl p-5 mb-6">
            <pre className="text-slate-700 leading-relaxed whitespace-pre-wrap font-sans text-sm">
              {article.content}
            </pre>
          </div>

          {/* FAQs */}
          {article.faqs && article.faqs.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                Frequently Asked Questions
              </h3>
              {article.faqs.map((faq, i) => (
                <FaqItem key={i} faq={faq} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Was this helpful?</span>
            <button
              onClick={() => setHelpful('up')}
              className={`p-2 rounded-lg transition-colors ${helpful === 'up' ? 'bg-green-100 text-green-600' : 'hover:bg-slate-100 text-slate-400'}`}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setHelpful('down')}
              className={`p-2 rounded-lg transition-colors ${helpful === 'down' ? 'bg-red-100 text-red-600' : 'hover:bg-slate-100 text-slate-400'}`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            {helpful && (
              <span className="text-sm text-green-600 font-medium">Thank you for your feedback!</span>
            )}
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function KnowledgeBasePage() {
  const { tenant, knowledgeArticles, addKnowledgeArticle } = useStore();
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle]   = useState<typeof KNOWLEDGE_DATA[0] | null>(null);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [newArticle, setNewArticle]       = useState({ title: '', content: '', category: 'Insurance Basics', tags: '' });
  const [viewMode]           = useState<'grid' | 'list'>('grid');

  // Merge built-in + store articles
  const allArticles = useMemo(() => {
    const storeArticles = knowledgeArticles.map((a) => ({
      id: a.id,
      category: a.category,
      icon: '📄',
      color: 'slate',
      title: a.title,
      content: a.content,
      tags: a.tags || '',
      faqs: [] as { q: string; a: string }[],
    }));
    return [...KNOWLEDGE_DATA, ...storeArticles];
  }, [knowledgeArticles]);

  const categories = useMemo(() => Array.from(new Set(allArticles.map((a) => a.category))), [allArticles]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allArticles.filter((a) => {
      const matchSearch = !q || a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.tags.toLowerCase().includes(q);
      const matchCat    = selectedCategory === 'all' || a.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [allArticles, searchQuery, selectedCategory]);

  const handleAddArticle = async () => {
    if (!newArticle.title || !newArticle.content) return;
    await addKnowledgeArticle({
      tenant_id: tenant?.id || '',
      title: newArticle.title,
      content: newArticle.content,
      category: newArticle.category,
      tags: newArticle.tags,
      is_published: true,
    });
    setNewArticle({ title: '', content: '', category: 'Insurance Basics', tags: '' });
    setShowAddModal(false);
  };

  const stats = useMemo(() => ({
    total: allArticles.length,
    categories: categories.length,
    faqs: allArticles.reduce((s, a) => s + (a.faqs?.length || 0), 0),
  }), [allArticles, categories]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Knowledge Base
          </h1>
          <p className="text-slate-500 mt-1">Comprehensive insurance guides, policy Q&A, and agency SOPs</p>
        </div>
        {tenant?.role === 'owner' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-200"
          >
            <PlusCircle className="w-4 h-4" /> Add Article
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Articles', value: stats.total, icon: <BookOpen className="w-5 h-5" />, color: 'blue' },
          { label: 'Categories', value: stats.categories, icon: <Tag className="w-5 h-5" />, color: 'purple' },
          { label: 'FAQs Answered', value: stats.faqs, icon: <HelpCircle className="w-5 h-5" />, color: 'green' },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br from-${s.color}-50 to-${s.color}-100 border border-${s.color}-200 rounded-2xl p-4 flex items-center gap-4`}
          >
            <div className={`p-3 bg-${s.color}-600 rounded-xl text-white shadow-lg`}>{s.icon}</div>
            <div>
              <div className={`text-2xl font-bold text-${s.color}-700`}>{s.value}</div>
              <div className="text-sm text-slate-600">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, topics, questions... (e.g. 'IDV', 'claim process', 'health premium')"
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-slate-500 mt-2 pl-2">
            Found <strong className="text-blue-600">{filtered.length}</strong> results for "{searchQuery}"
          </p>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
              : 'bg-white/80 text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          All ({allArticles.length})
        </button>
        {categories.map((cat) => {
          const cfg = CATEGORY_CONFIG[cat] || { color: 'text-slate-600', bg: 'bg-slate-50', icon: <BookOpen className="w-4 h-4" /> };
          const count = allArticles.filter((a) => a.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : `bg-white/80 ${cfg.color} hover:${cfg.bg} border border-slate-200`
              }`}
            >
              {cfg.icon}
              {cat} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Articles */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        <AnimatePresence>
          {filtered.length > 0 ? (
            filtered.map((article, i) => {
              const cfg = CATEGORY_CONFIG[article.category] || { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: <BookOpen className="w-5 h-5" /> };
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
                  className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-md border border-white/30 p-6 cursor-pointer hover:border-blue-200 transition-all group"
                  onClick={() => setSelectedArticle(article)}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${cfg.bg} ${cfg.color} border ${cfg.border} group-hover:scale-110 transition-transform`}>
                      {cfg.icon}
                    </div>
                    <span className="text-2xl">{article.icon}</span>
                  </div>

                  {/* Category Badge */}
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border} mb-2`}>
                    {article.category}
                  </span>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                    {article.content.substring(0, 120)}...
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        {article.faqs?.length || 0} FAQs
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {Math.floor(Math.random() * 300 + 50)} views
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-blue-500 group-hover:gap-2 transition-all font-medium">
                      Read more →
                    </span>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-3 text-center py-16"
            >
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-200" />
              <h3 className="text-lg font-semibold text-slate-500">No articles found</h3>
              <p className="text-slate-400 mt-1">Try a different search term or category</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Reference Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-300" />
          Quick Reference — Policy Documents Required
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { type: 'Motor', docs: ['RC Book', 'Aadhaar', 'PAN', 'DL', 'Previous Policy'], icon: '🚗' },
            { type: 'Health', docs: ['Aadhaar', 'PAN', 'Blood Report', 'Medical Records', 'Height/Weight'], icon: '❤️' },
            { type: 'Life', docs: ['Aadhaar', 'PAN', 'Income Proof', 'Medical Exam', 'Nominee Proof'], icon: '🛡️' },
            { type: 'Term', docs: ['Aadhaar', 'PAN', 'Income Proof', 'Medical Report', 'Nominee Docs'], icon: '📋' },
            { type: 'Home', docs: ['Property Docs', 'Aadhaar', 'PAN', 'Survey Report', 'Valuation'], icon: '🏠' },
            { type: 'Travel', docs: ['Passport', 'Visa Copy', 'Air Tickets', 'Aadhaar', 'Travel Docs'], icon: '✈️' },
            { type: 'Others', docs: ['Aadhaar', 'PAN', 'Coverage Docs', 'KYC Docs', 'Application Form'], icon: '🔒' },
          ].map((p) => (
            <div key={p.type} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-2xl mb-1">{p.icon}</div>
              <div className="font-bold text-sm mb-2">{p.type}</div>
              <ul className="space-y-1">
                {p.docs.map((d) => (
                  <li key={d} className="text-xs text-white/80 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-300 flex-shrink-0" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Contact Support */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <Phone className="w-6 h-6" />, title: 'Call Support', desc: 'Mon-Sat, 9AM-6PM', info: '+91 98765 43210', color: 'green' },
          { icon: <MessageSquare className="w-6 h-6" />, title: 'WhatsApp', desc: 'Quick responses', info: 'Chat Now', color: 'teal' },
          { icon: <Info className="w-6 h-6" />, title: 'IRDAI Helpline', desc: 'Insurance queries', info: '155255 / 1800-4254-732', color: 'blue' },
        ].map((c) => (
          <div key={c.title} className={`bg-gradient-to-br from-${c.color}-50 to-${c.color}-100 border border-${c.color}-200 rounded-2xl p-5 flex items-center gap-4`}>
            <div className={`p-3 bg-${c.color}-600 rounded-xl text-white shadow-lg`}>{c.icon}</div>
            <div>
              <div className="font-bold text-slate-800">{c.title}</div>
              <div className="text-sm text-slate-500">{c.desc}</div>
              <div className={`text-sm font-semibold text-${c.color}-700 mt-1`}>{c.info}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
        )}
      </AnimatePresence>

      {/* Add Article Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Add Knowledge Article</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Article title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select
                    value={newArticle.category}
                    onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newArticle.tags}
                    onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tag1, tag2, tag3..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content *</label>
                  <textarea
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Write the article content here..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddArticle}
                  disabled={!newArticle.title || !newArticle.content}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
                >
                  Publish Article
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
