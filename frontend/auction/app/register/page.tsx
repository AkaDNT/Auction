"use client";

import React, { startTransition, useEffect, useState } from "react";
import styled from "styled-components";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "./action";
import toast from "react-hot-toast";

const StyledWrapper = styled.div`
  .error {
    color: red;
    font-size: 0.8rem;
    margin-top: 4px;
    display: block;
  }

  .input:focus {
    outline: none;
    border-color: #4f46e5;
  }

  .submit:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 350px;
    padding: 20px;
    border-radius: 20px;
    position: relative;
    background-color: #1a1a1a;
    color: #fff;
    border: 1px solid #333;
  }

  .title {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -1px;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 30px;
    color: #00bfff;
  }

  .title::before {
    width: 18px;
    height: 18px;
  }

  .title::after {
    width: 18px;
    height: 18px;
    animation: pulse 1s linear infinite;
  }

  .title::before,
  .title::after {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    border-radius: 50%;
    left: 0px;
    background-color: #00bfff;
  }

  .message,
  .signin {
    font-size: 14.5px;
    color: rgba(255, 255, 255, 0.7);
  }

  .signin {
    text-align: center;
  }

  .signin a:hover {
    text-decoration: underline royalblue;
  }

  .signin a {
    color: #00bfff;
  }

  .flex {
    display: flex;
    width: 100%;
    gap: 6px;
  }

  .form label {
    position: relative;
  }

  .form label .input {
    background-color: #333;
    color: #fff;
    width: 100%;
    padding: 20px 05px 05px 10px;
    outline: 0;
    border: 1px solid rgba(105, 105, 105, 0.397);
    border-radius: 10px;
  }

  .form label .input + span {
    color: rgba(255, 255, 255, 0.5);
    position: absolute;
    left: 10px;
    top: 0px;
    font-size: 0.9em;
    cursor: text;
    transition: 0.3s ease;
  }

  .form label .input:placeholder-shown + span {
    top: 12.5px;
    font-size: 0.9em;
  }

  .form label .input:focus + span,
  .form label .input:valid + span {
    color: #00bfff;
    top: 0px;
    font-size: 0.7em;
    font-weight: 600;
  }

  .input {
    font-size: medium;
  }

  .submit {
    border: none;
    outline: none;
    padding: 10px;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    transform: 0.3s ease;
    background-color: #00bfff;
  }

  .submit:hover {
    background-color: #00bfff96;
  }

  @keyframes pulse {
    from {
      transform: scale(0.9);
      opacity: 1;
    }

    to {
      transform: scale(1.8);
      opacity: 0;
    }
  }
`;

export default function SignupPage() {
  const [state, formAction] = useActionState(signupUser, null);
  const router = useRouter();
  const [errors, setErrors] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (state?.success) {
      toast.success("Sign up successfully");
      router.replace("/login");
    } else if (state?.success === false) {
      toast.error(
        "Failed to sign up\n" +
          state.message.status +
          ": " +
          state.message.message
      );
    }
  }, [state, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "displayName":
        if (value.trim().length < 2) {
          error = "Display name must be at least 2 characters";
        }
        break;

      case "email":
        if (!/^\S+@\S+\.\S+$/.test(value)) {
          error = "Invalid email format";
        }
        break;

      case "password":
        if (value.length < 6) {
          error = "Password must be at least 6 characters";
        } else if (
          !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(value)
        ) {
          error =
            "Must include uppercase, lowercase, number and special character";
        }
        break;

      case "confirmPassword":
        if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasErrors = false;

    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key as keyof typeof formData]);
      if (errors[key as keyof typeof errors]) hasErrors = true;
    });

    if (hasErrors) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Create FormData and submit
    const submitFormData = new FormData();
    submitFormData.append("displayName", formData.displayName);
    submitFormData.append("email", formData.email);
    submitFormData.append("password", formData.password);

    startTransition(() => {
      formAction(submitFormData);
    });
  };

  return (
    <div className="bg-gray-300 shadow-xl rounded-xl p-8 w-full max-w-md mx-auto">
      <StyledWrapper>
        <form onSubmit={handleSubmit} className="form" autoComplete="off">
          <p className="title">Register</p>
          <p className="message">Signup now and get full access to our app.</p>

          <label>
            <input
              className="input"
              name="displayName"
              type="text"
              placeholder="Display name"
              value={formData.displayName}
              onChange={handleChange}
            />
            {errors.displayName && (
              <span className="error">{errors.displayName}</span>
            )}
          </label>

          <label>
            <input
              className="input"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </label>

          <label>
            <input
              className="input"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </label>

          <label>
            <input
              className="input"
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword}</span>
            )}
          </label>

          <button
            className="submit"
            type="submit"
            disabled={
              Object.values(errors).some((e) => e) || !formData.confirmPassword
            }
          >
            Submit
          </button>

          <p className="signin">
            Already have an account? <a href="/login">Signin</a>
          </p>
        </form>
      </StyledWrapper>
    </div>
  );
}
