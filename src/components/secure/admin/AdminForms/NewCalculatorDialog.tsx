import cx from "classnames";
import trim from "lodash/trim";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { Toast, ToastMessage } from "primereact/toast";


import { FormErrorMessage } from "@/components/shared/FormErrorMessage";
import { useUploadNewCalculatorMutation } from "@/redux/hooks/apiHooks";
import useCalculatorsInfo from "@/hooks/useCalculatorsInfo";
import { toPascalCase } from "@/helpers/util";
import { AutoComplete, AutoCompleteChangeEvent, AutoCompleteCompleteEvent } from "primereact/autocomplete";

const POLLING_INTERVAL = 3000;

interface FormValues {
  label: string;
  description: string;
}

interface NewCalculatorDialogProps {
  toastRef?: any;
}

const NewCalculatorDialog: React.FC<NewCalculatorDialogProps> = ({ toastRef }) => {
  const [uploadNewCalculator, { isLoading: isUploading }] =
    useUploadNewCalculatorMutation();

  const [newCalculatorDialogVisible, setNewCalculatorDialogVisible] =
    useState<boolean>(false);
  const { refetchCalcInfo, calcInfoMap } = useCalculatorsInfo();

  const [suggestions, setSuggestions] = useState<Array<string>>([]);

  useEffect(() => {
    setSuggestions(Object.keys(calcInfoMap).map(calcType => calcInfoMap[calcType].type));
  }, [calcInfoMap]);

  const showToast = (
    response: { label: string; message: string },
    ref: React.RefObject<Toast>,
    severity: ToastMessage["severity"]
  ) => {
    ref?.current?.show({
      severity: severity,
      summary: response.label,
      detail: response.message,
      life: 3000,
    });
  };

  const onSubmit = async (data: FormValues) => {
    const payload = {
      label: trim(data.label),
      description: trim(data.description),
      type: trim(toPascalCase(data.label))
    };

    try {
      const response = await uploadNewCalculator(
        payload
      ).unwrap();

      showToast(
        {
          label: "Success",
          message: "Successfully added new calculator",
        },
        toastRef,
        "success"
      );
      refetchCalcInfo();
    } catch (error) {
      showToast(
        {
          label: "Error",
          message: typeof (error as any)?.data?.message === "string"
            ? (error as any)?.data?.message
            : "Failed to add new calculator."
        },
        toastRef,
        "error"
      );
    }
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      label: "",
      description: "",
    },
  });
  return (
    <>
      <Button
        label="Add new calculator"
        size="small"
        className="ml-3 text-md px-3 py-3"
        onClick={() => setNewCalculatorDialogVisible(true)}
      />
      <Dialog
        header="Add new calculator"
        visible={newCalculatorDialogVisible}
        maximizable
        style={{ width: "50vw" }}
        onHide={() => setNewCalculatorDialogVisible(false)}
        footer={
          <>
            <Button
              label="Publish"
              className="p-button p-button-primary"
              icon="pi pi-check"
              onClick={handleSubmit(onSubmit)}
              autoFocus
            />
            <Button
              label="Cancel"
              className="p-button p-button-outlined"
              icon="pi pi-times"
              onClick={() => setNewCalculatorDialogVisible(false)}
            />
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">

          <Controller
            name="label"
            control={control}
            rules={{
              required: "Please provide calculator name.",
            }}
            render={({ field, fieldState }) => {
              const search = (event: AutoCompleteCompleteEvent) => {
                setSuggestions(Object.keys(calcInfoMap).filter(calcType => calcInfoMap[calcType].label.includes(event.query)));
              }
              return (
                <div className="col-12 md:col-6">
                  <label
                    htmlFor={field.name}
                    className={cx({ "p-error": errors[field.name] })}
                  />

                  <span className="p-float-label w-full">
                    <AutoComplete id={field.name} value={field.value} disabled={isUploading} suggestions={suggestions.map((calcType) => calcInfoMap[calcType].label)} completeMethod={search} onChange={(e) => field.onChange(e.target.value)} dropdown />

                    <label className="bg-beige" htmlFor={field.name}>
                      Calculator Name
                    </label>
                  </span>

                  {FormErrorMessage({ message: errors[field.name]?.message })}
                </div>
              )
            }}
          />

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <div className="col-12 md:col-6">
                <label
                  htmlFor={field.name}
                  className={cx({ "p-error": errors[field.name] })}
                />

                <span className="p-float-label w-full">
                  <InputText
                    id={field.name}
                    value={field.value}
                    disabled={isUploading}
                    className={cx([
                      { "p-invalid": fieldState.error },
                      "w-full",
                    ])}
                    onChange={(e) => field.onChange(e.target.value)}
                  />

                  <label className="bg-beige" htmlFor={field.name}>
                    Calculator Description
                  </label>
                </span>

                {FormErrorMessage({ message: errors[field.name]?.message })}
              </div>
            )}
          />
        </form>
      </Dialog>
    </>
  )
}

export default NewCalculatorDialog;