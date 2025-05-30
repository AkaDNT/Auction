"use client";
import React, { useEffect } from "react";
import { FieldValues, useForm } from "react-hook-form";
import Input from "../components/Input";
import { Button, Spinner } from "flowbite-react";
import { usePathname, useRouter } from "next/navigation";
import { createAuction } from "../actions/auctionAction";
import toast from "react-hot-toast";

export default function AuctionForm() {
  const {
    control,
    handleSubmit,
    setFocus,
    formState: { isSubmitting, isDirty, isValid },
  } = useForm({
    mode: "onTouched",
  });
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    setFocus("make");
  }, [setFocus]);

  async function onSubmit(data: FieldValues) {
    try {
      let res;
      if (pathName === "/auctions/create") {
        res = await createAuction(data);
      }
      if (res.error) {
        throw res.error;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.status + " " + error.message);
    }
  }

  return (
    <form className="flex flex-col mt-3" onSubmit={handleSubmit(onSubmit)}>
      <Input
        name="make"
        label="Make"
        control={control}
        rules={{ required: "Make is required" }}
      ></Input>
      <Input
        name="model"
        label="Model"
        control={control}
        rules={{ required: "Model is required" }}
      ></Input>
      <Input
        name="color"
        label="Color"
        control={control}
        rules={{ required: "Color is required" }}
      ></Input>
      <div className="grid grid-cols-2 gap-3">
        <Input
          name="year"
          type="number"
          label="Year"
          control={control}
          rules={{ required: "Year is required" }}
        ></Input>
        <Input
          name="mileage"
          type="number"
          label="Mileage"
          control={control}
          rules={{ required: "Mileage is required" }}
        ></Input>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          name="reservePrice"
          type="number"
          label="Reserve price (enter 0 if no reserve)"
          control={control}
          rules={{ required: "Reserve price is required" }}
        ></Input>
        <Input
          name="auctionEnd"
          type="datetime-local"
          label="Auction end date/time"
          control={control}
          rules={{ required: "Auction end date is required" }}
        ></Input>
      </div>
      <Input
        name="imageURL"
        label="Image URL"
        control={control}
        rules={{ required: "Image URL is required" }}
      ></Input>
      <div className="flex justify-between">
        <Button color={"alternative"} onClick={() => router.push("/")}>
          Cancle
        </Button>
        <Button
          outline
          color={"green"}
          type="submit"
          disabled={!isValid || !isDirty}
        >
          {isSubmitting && <Spinner size="sm"></Spinner>}
          Submit
        </Button>
      </div>
    </form>
  );
}
