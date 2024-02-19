import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useState } from "react";

interface SaveDialogProps {
  visible: boolean;
  defaultValue: string;
  onClose: (_?: string) => void;
}

const SaveDialog: React.FC<SaveDialogProps> = ({
  visible,
  defaultValue,
  onClose,
}) => {
  const [value, setValue] = useState<string>("");

  const canSave = !value || value === defaultValue;

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <Dialog
      header="Save Result"
      blockScroll
      className="w-10 md:w-6 xl:w-4"
      visible={visible}
      onHide={onClose}
    >
      <div className="flex flex-column gap-4">
        <InputText
          placeholder="Result Name"
          className="p-3"
          value={value}
          onChange={(evt) => setValue(evt.target.value)}
        />

        <div className="flex justify-content-end gap-2">
          <Button
            label="Save"
            size="small"
            disabled={canSave}
            onClick={() => onClose(value)}
          />
          <Button label="Cancel" size="small" onClick={() => onClose()} />
        </div>
      </div>
    </Dialog>
  );
};

export default SaveDialog;
