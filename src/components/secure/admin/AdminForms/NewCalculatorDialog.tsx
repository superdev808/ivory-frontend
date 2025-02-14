import cx from "classnames";
import trim from "lodash/trim";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Controller, useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { Toast, ToastMessage } from "primereact/toast";
import { FormErrorMessage } from "@/components/shared/FormErrorMessage";
import { useUploadNewCalculatorMutation } from "@/redux/hooks/apiHooks";
import useCalculatorsInfo from "@/hooks/useCalculatorsInfo";
import { toPascalCase } from "@/helpers/util";
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
} from "primereact/autocomplete";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { OUTPUT_UI_TYPES } from "@/constants/calculators";

interface FormValues {
  label: string;
  description: string;
  outputType: string;
}

interface NewCalculatorDialogProps {
  toastRef?: any;
}

const NewCalculatorDialog: React.FC<NewCalculatorDialogProps> = ({
  toastRef,
}) => {
  const [uploadNewCalculator, { isLoading: isUploading }] =
    useUploadNewCalculatorMutation();

  const [newCalculatorDialogVisible, setNewCalculatorDialogVisible] =
    useState<boolean>(false);
  const { refetchCalcInfo, calcInfoMap } = useCalculatorsInfo();

  const [suggestions, setSuggestions] = useState<Array<string>>([]);

  const findSuggestions = useCallback(
    (label: string) =>
      Object.keys(calcInfoMap).sort().filter((calcType) =>
        calcInfoMap[calcType].label.toLowerCase().includes(label.toLowerCase())
      ),
    [calcInfoMap]
  );

  const outputTypeOptions = Object.keys(OUTPUT_UI_TYPES)
    .map((outputType) => ({
      id: outputType,
      label: OUTPUT_UI_TYPES[outputType],
    }));

  useEffect(() => {
    setSuggestions(findSuggestions(""));
  }, [findSuggestions]);

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
      type: trim(toPascalCase(data.label)),
      outputType: trim(data.outputType),
    };

    try {
      const response = await uploadNewCalculator(payload).unwrap();

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
          message:
            typeof (error as any)?.data?.message === "string"
              ? (error as any)?.data?.message
              : "Failed to add new calculator.",
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      label: "",
      description: "",
      outputType: "",
    },
  });

  return (
    <>
      <Button
        label="Add/Update Calculator"
        size="small"
        className="ml-3 text-md px-3 py-3"
        onClick={() => setNewCalculatorDialogVisible(true)}
      />
      <Dialog
        header={suggestions.length == 1 ? "Update Calculator" : "Add New Calculator"}
        visible={newCalculatorDialogVisible}
        maximizable
        style={{ width: "50vw" }}
        onHide={() => setNewCalculatorDialogVisible(false)}
        footer={
          <>
            <Button
              label={suggestions.length == 1 ? "Update" : "Add"}
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column">
          <Controller
            name="label"
            control={control}
            rules={{
              required: "Please provide calculator name.",
            }}
            render={({ field, fieldState }) => {
              const search = (event: AutoCompleteCompleteEvent) => {
                setSuggestions(findSuggestions(event.query));
              };
              return (
                <div className="flex-1">
                  <label
                    htmlFor={field.name}
                    className={cx({ "p-error": errors[field.name] })}
                  />

                  <span className="p-float-label w-full">
                    <AutoComplete
                      id={field.name}
                      value={field.value}
                      disabled={isUploading}
                      suggestions={suggestions.map(
                        (calcType) => calcInfoMap[calcType].label
                      )}
                      completeMethod={search}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        let newSuggestions = findSuggestions(e.target.value);
                        setSuggestions(newSuggestions);
                        if (
                          newSuggestions.length == 1 &&
                          calcInfoMap[newSuggestions[0]].label == e.target.value
                        ) {
                          setValue(
                            "description",
                            calcInfoMap[newSuggestions[0]].description || ""
                          );
                          setValue("outputType", calcInfoMap[newSuggestions[0]].outputType || "");
                        }
                      }}
                      dropdown
                    />

                    <label className="bg-beige" htmlFor={field.name}>
                      Calculator Name
                    </label>
                  </span>

                  {FormErrorMessage({ message: errors[field.name]?.message })}
                </div>
              );
            }}
          />
          <Controller
            name="outputType"
            control={control}
            rules={{ required: "Please select Output Type." }}
            render={({ field, fieldState }) => (
              <div className="flex-1">
                <span className="p-float-label w-full">
                  <Dropdown
                    {...field}
                    disabled={isUploading}
                    options={outputTypeOptions}
                    optionLabel="label"
                    optionValue="id"
                    className={cx({ "p-invalid": fieldState.error }, "w-full")}
                  />
                  <label className="bg-beige" htmlFor={field.name}>
                    Output Type
                  </label>
                </span>

                {FormErrorMessage({ message: errors[field.name]?.message })}
              </div>
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex-1">
                <label
                  htmlFor={field.name}
                  className={cx({ "p-error": errors[field.name] })}
                />

                <span className="p-float-label w-full">
                  <InputTextarea
                    id={field.name}
                    value={field.value}
                    disabled={isUploading}
                    className={cx([
                      { "p-invalid": fieldState.error },
                      "w-full",
                    ])}
                    onChange={(e) => field.onChange(e.target.value)}
                    rows={5}
                    autoResize={true}
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
  );
};

export default NewCalculatorDialog;
