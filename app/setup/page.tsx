/**
 * Setup flow page — three-step onboarding for account setup, profile completion, and listing upload.
 *
 * - No data persistence (per requirement)
 * - Uses step state management (0-3, where 3 is success)
 * - Follows styling patterns from application-form.tsx
 */
"use client";

import { useState } from "react";
import Link from "next/link";

type Step = 0 | 1 | 2 | 3; // 0: account, 1: profile, 2: listing, 3: success

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

export default function Setup() {
  const [step, setStep] = useState<Step>(0);

  // Form state for each step
  const [accountData, setAccountData] = useState({ email: "", password: "" });
  const [profileData, setProfileData] = useState({
    bio: "",
    avatar: "",
    name: "",
    location: "",
  });
  const [listingData, setListingData] = useState({
    productName: "",
    description: "",
    price: "",
    images: "",
  });

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 0) setStep((step - 1) as Step);
  };

  const handleSubmit = () => {
    // No data persistence per requirement
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Setup
        </h1>

        {/* Modal container */}
        <div className="relative h-[620px] rounded-2xl p-6 setup-modal">
          {/* Step indicator */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {[0, 1, 2].map((s) => (
              <div
                key={s}
                className={`h-2 w-2 rounded-full ${
                  s === step ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>

        {/* Step 0: Account Setup */}
        {step === 0 && (
          <div className="space-y-4 pb-20">
            <h2 className="text-xl font-semibold text-white">
              Account Setup
            </h2>
            <Field label="Email" required>
              <input
                type="email"
                className={inputClass}
                value={accountData.email}
                onChange={(e) =>
                  setAccountData({ ...accountData, email: e.target.value })
                }
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password" required>
              <input
                type="password"
                className={inputClass}
                value={accountData.password}
                onChange={(e) =>
                  setAccountData({ ...accountData, password: e.target.value })
                }
                placeholder="••••••••"
              />
            </Field>
            <div className="absolute bottom-6 left-6 right-6 flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Profile Completion */}
        {step === 1 && (
          <div className="space-y-4 pb-20">
            <h2 className="text-xl font-semibold text-white">
              Profile Completion
            </h2>
            <Field label="Name" required>
              <input
                className={inputClass}
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </Field>
            <Field label="Location" required>
              <input
                className={inputClass}
                value={profileData.location}
                onChange={(e) =>
                  setProfileData({ ...profileData, location: e.target.value })
                }
                placeholder="San Francisco, CA"
              />
            </Field>
            <Field label="Avatar URL">
              <input
                type="url"
                className={inputClass}
                value={profileData.avatar}
                onChange={(e) =>
                  setProfileData({ ...profileData, avatar: e.target.value })
                }
                placeholder="https://..."
              />
            </Field>
            <Field label="Bio">
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                value={profileData.bio}
                onChange={(e) =>
                  setProfileData({ ...profileData, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
            </Field>
            <div className="absolute bottom-6 left-6 right-6 flex justify-between pt-2">
              <button
                onClick={handleBack}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Listing Upload */}
        {step === 2 && (
          <div className="space-y-4 pb-20">
            <h2 className="text-xl font-semibold text-white">
              Listing Upload
            </h2>
            <Field label="Product Name" required>
              <input
                className={inputClass}
                value={listingData.productName}
                onChange={(e) =>
                  setListingData({ ...listingData, productName: e.target.value })
                }
                placeholder="Vintage T-Shirt"
              />
            </Field>
            <Field label="Description" required>
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                value={listingData.description}
                onChange={(e) =>
                  setListingData({ ...listingData, description: e.target.value })
                }
                placeholder="Describe your product..."
                maxLength={1000}
              />
            </Field>
            <Field label="Price" required>
              <input
                type="number"
                className={inputClass}
                value={listingData.price}
                onChange={(e) =>
                  setListingData({ ...listingData, price: e.target.value })
                }
                placeholder="29.99"
                step="0.01"
              />
            </Field>
            <Field label="Image URLs">
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                value={listingData.images}
                onChange={(e) =>
                  setListingData({ ...listingData, images: e.target.value })
                }
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                maxLength={2000}
              />
            </Field>
            <div className="absolute bottom-6 left-6 right-6 flex justify-between pt-2">
              <button
                onClick={handleBack}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white">
              Setup Complete!
            </h2>
            <p className="text-white/80">
              Your account has been set up successfully.
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white/90"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
