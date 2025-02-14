import classNames from "classnames/bind";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast, ToastMessage } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import {
  TriStateCheckbox,
  TriStateCheckboxChangeEvent,
} from "primereact/tristatecheckbox";
import React, { useRef, useState } from "react";

import { USER_ROLES_OPTIONS } from "@/constants/users";
import { formatDate, formatTime } from "@/helpers/util";
import { convertDataToExcelFormat } from "@/helpers/excel";
import {
  useGetUsersListQuery,
  usePostDeactivateUserMutation,
  usePostSendResetPasswordMutation,
  usePostSendVerificationEmailMutation,
  usePostActivateUserMutation,
} from "@/redux/hooks/apiHooks";
import useDownload from "@/hooks/useDownload";
import { EditUser } from "@/types/UserTypes";
import {
  organizationRoleMap,
  referralSourceMap,
} from "@/components/auth/register/RegisterForms/constants";

import AdminEditUser from "./AdminForms/AdminEditUser";

import styles from "./Admin.module.scss";

const cx = classNames.bind(styles);

const AdminUserManagement: React.FC = () => {
  const { data, refetch } = useGetUsersListQuery({});
  const [postSendResetPassword] = usePostSendResetPasswordMutation();
  const [postSendVerificationEmail] = usePostSendVerificationEmailMutation();
  const [postDeactivateUser] = usePostDeactivateUserMutation();
  const [postActivateUser] = usePostActivateUserMutation();
  const { download } = useDownload();

  const [visibleEditUser, setVisibleEditUser] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<EditUser | null>(null);

  const menuPanel = useRef<OverlayPanel>(null);
  const toast = useRef(null);

  const [filters, setFilters] = useState<DataTableFilterMeta>({
    firstName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    lastName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    organizationName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    organizationState: { value: null, matchMode: FilterMatchMode.EQUALS },
    role: { value: null, matchMode: FilterMatchMode.CONTAINS },
    verified: { value: null, matchMode: FilterMatchMode.EQUALS },
    active: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const onEditUser = () => {
    setVisibleEditUser(true);
  };

  const onUpdateUser = (response: { label: string; message: string }) => {
    refetch();
    showToast(response, toast, "success");
  };

  const onSendResetPassword = async (user: EditUser) => {
    confirmDialog({
      message: "Are you sure you want to proceed?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",

      accept: async () => {
        try {
          const response: any = await postSendResetPassword({ id: user._id });

          if (response.error) {
            throw new Error(
              "An error occurred while sending reset password email."
            );
          }

          showToast(
            {
              label: "Success",
              message: "Reset password email sent successfully.",
            },
            toast,
            "success"
          );
        } catch (error) {
          showToast(
            {
              label: "Error",
              message: "An error occurred while sending reset password email.",
            },
            toast,
            "error"
          );
        }
      },
    });
  };

  const onSendVerificationEmail = async (user: EditUser) => {
    confirmDialog({
      message: "Are you sure you want to proceed?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",

      accept: async () => {
        try {
          const response: any = await postSendVerificationEmail({
            email: user.email,
          });

          if (response.error) {
            throw new Error(
              "An error occurred while sending verification email."
            );
          }

          showToast(
            {
              label: "Success",
              message: "Verification email sent successfully.",
            },
            toast,
            "success"
          );
        } catch (error) {
          showToast(
            {
              label: "Error",
              message: "An error occurred while sending verification email.",
            },
            toast,
            "error"
          );
        }
      },
    });
  };

  const onDeactivateUser = async (user: EditUser) => {
    confirmDialog({
      message: "Are you sure you want to proceed?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",

      accept: async () => {
        try {
          const response: any = await postDeactivateUser({ id: user._id });

          if (response.error) {
            throw new Error("An error occurred while deactivating user.");
          }

          showToast(
            { label: "Success", message: "User deactivated successfully." },
            toast,
            "success"
          );

          refetch();
        } catch (error) {
          showToast(
            {
              label: "Error",
              message: "An error occurred while deactivating user.",
            },
            toast,
            "error"
          );
        }
      },
    });
  };

  const onActivateUser = async (user: EditUser) => {
    confirmDialog({
      message: "Are you sure you want to proceed?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",

      accept: async () => {
        try {
          const response: any = await postActivateUser({ id: user._id });

          if (response.error) {
            throw new Error("An error occurred while activating user.");
          }

          showToast(
            { label: "Success", message: "User activated successfully." },
            toast,
            "success"
          );

          refetch();
        } catch (error) {
          showToast(
            {
              label: "Error",
              message: "An error occurred while activating user.",
            },
            toast,
            "error"
          );
        }
      },
    });
  };

  const showToast = (
    response: { label: string; message: string },
    ref: React.RefObject<Toast>,
    severity: ToastMessage["severity"]
  ) => {
    ref.current?.show({
      severity: severity,
      summary: response.label,
      detail: response.message,
      life: 3000,
    });
  };

  const checkBodyTemplate = (value: boolean) => (
    <div className="px-4">
      <div
        className={cx(
          { "text-light-green": value, "text-light-brown": !value },
          "border-round w-5 font-bold p-1"
        )}
      >
        {value ? (
          <i className="pi pi-check-circle" />
        ) : (
          <i className="pi pi-times-circle" />
        )}
      </div>
    </div>
  );

  const actionsBodyTemplate = (row: EditUser) => (
    <>
      <Button
        icon="pi pi-ellipsis-v"
        rounded
        text
        onClick={(e) => {
          (menuPanel.current as OverlayPanel).toggle(e);
          setSelectedUser(row);
        }}
      />

      <OverlayPanel
        pt={{
          content: { className: "py-0 px-4 text-sm" },
          root: { className: "border-round-lg	shadow-2 border-1 border-100" },
        }}
        ref={menuPanel}
        onHide={() => setSelectedUser(null)}
      >
        <p
          className={cx("navLink")}
          onClick={(e) => {
            onEditUser();
            (menuPanel.current as OverlayPanel).toggle(e);
          }}
        >
          Edit
        </p>

        {!selectedUser?.verified && (
          <p
            className={cx("navLink")}
            onClick={() => {
              onSendVerificationEmail(selectedUser as EditUser);
            }}
          >
            Send Verification Email
          </p>
        )}

        <p
          className={cx("navLink")}
          onClick={() => {
            onSendResetPassword(selectedUser as EditUser);
          }}
        >
          Reset Password
        </p>

        <p
          className={cx("navLink")}
          onClick={() => {
            if (selectedUser?.active === true) {
              onDeactivateUser(selectedUser as EditUser);
            } else {
              onActivateUser(selectedUser as EditUser);
            }
          }}
        >
          {selectedUser?.active ? "Deactivate" : "Activate"}
        </p>
      </OverlayPanel>
    </>
  );

  const defaultFilterTemplate = (
    options: ColumnFilterElementTemplateOptions
  ) => (
    <InputText
      className="p-inputtext-sm"
      value={options.value}
      onChange={(e) => options.filterApplyCallback(e.target.value)}
    />
  );

  const triStateFilterTemplate = (
    options: ColumnFilterElementTemplateOptions
  ) => (
    <div className="flex justify-content-center">
      <TriStateCheckbox
        value={options.value}
        onChange={(e: TriStateCheckboxChangeEvent) =>
          options.filterApplyCallback(e.value)
        }
      />
    </div>
  );

  const roleFilterTemplate = (options: ColumnFilterElementTemplateOptions) => (
    <Dropdown
      value={options.value}
      options={USER_ROLES_OPTIONS}
      onChange={(e) => options.filterApplyCallback(e.value)}
      optionLabel="label"
      optionValue="value"
      placeholder="Any"
      className="p-column-filter border-round-xl w-full"
    />
  );

  const getRowVerificationEmailContent = (row: EditUser) =>
    row.verificationEmailSent
      ? `${formatDate(row.verificationEmailSent)} ${formatTime(
        row.verificationEmailSent
      )}`
      : "";

  const verificationEmailTemplate = (row: EditUser) => (
    <div className="flex justify-content-center">
      {getRowVerificationEmailContent(row)}
    </div>
  );

  const getRowLastActivityDateContent = (row: EditUser) =>
    row.lastActivityDate
      ? `${formatDate(row.lastActivityDate)} ${formatTime(
        row.lastActivityDate
      )}`
      : "";

  const lastActivityDateTemplate = (row: EditUser) => (
    <div className="flex justify-content-center">
      {getRowLastActivityDateContent(row)}
    </div>
  );

  const getRowReferralSourceContent = (row: EditUser) =>
    referralSourceMap[row.referralSource] || "";

  const columns = [
    {
      field: "firstName",
      header: "First Name",
      body: (row: EditUser) => <span>{row.firstName}</span>,
      sortable: true,
      filter: true,
    },
    {
      field: "lastName",
      header: "Last Name",
      body: (row: EditUser) => <span>{row.lastName}</span>,
      sortable: true,
      filter: true,
    },
    {
      field: "email",
      header: "Email",
      body: (row: EditUser) => <span>{row.email}</span>,
      sortable: true,
      filter: true,
    },
    {
      field: "role",
      header: "Role",
      body: (row: EditUser) => <span>{getRowRoleContent(row)}</span>,
      sortable: true,
      filter: true,
      filterElement: roleFilterTemplate,
    },
    {
      field: "organizationName",
      header: "Organization",
      body: (row: EditUser) => <span>{row.organizationName}</span>,
      sortable: true,
      filter: true,
    },
    {
      field: "organizationState",
      header: "Location",
      body: (row: EditUser) => (
        <span className="px-4">{row.organizationState}</span>
      ),
      sortable: true,
      filter: true,
    },
    {
      field: "verified",
      header: "Verified?",
      body: (row: EditUser) => checkBodyTemplate(row.verified),
      sortable: true,
      filter: true,
      filterElement: triStateFilterTemplate,
    },
    {
      field: "verified",
      header: "Verification email sent?",
      body: (row: EditUser) => verificationEmailTemplate(row),
      sortable: true,
      filterElement: triStateFilterTemplate,
    },
    {
      field: "referralSource",
      header: "How did you hear about us?",
      body: (row: EditUser) => (
        <span className="px-4">{getRowReferralSourceContent(row)}</span>
      ),
      sortable: true,
    },
    {
      field: "active",
      header: "Active?",
      body: (row: EditUser) => checkBodyTemplate(row.active),
      sortable: true,
      filter: true,
      filterElement: triStateFilterTemplate,
    },
    {
      field: "lastActivityDate",
      header: "Last Activity",
      body: (row: EditUser) => lastActivityDateTemplate(row),
      sortable: true,
      filterElement: triStateFilterTemplate,
    },
    {
      field: "actions",
      body: (row: EditUser) => actionsBodyTemplate(row),
      sortable: false,
    },
  ];

  const getRowRoleContent = (row: EditUser) => {
    let role = organizationRoleMap[row.organizationRole];
    if (row.role.toLocaleLowerCase() === "admin") {
      role = `${role} (Admin)`;
    }
    return role;
  };

  const handleDownload = () => {
    const res = data.map((row: EditUser) => ({
      "First Name": row.firstName,
      "Last Name": row.lastName,
      Email: row.email,
      Role: getRowRoleContent(row),
      Organization: row.organizationName,
      Location: row.organizationState,
      "Verified?": row.verified ? "Yes" : "No",
      "Verification email sent?": getRowVerificationEmailContent(row),
      "How did you hear about us?": getRowReferralSourceContent(row),
      "Active?": row.active ? "Yes" : "No",
      "Last Activity": getRowLastActivityDateContent(row),
    }));

    const blob = convertDataToExcelFormat(res);
    download(blob, "Users List.xlsx");
  };

  return (
    <>
      <div className="mb-3 flex align-items-center justify-content-between">
        <span className="text-2xl font-semibold">User Management</span>
        <Button
          className="p-button p-button-lg"
          label="Export"
          onClick={handleDownload}
        />
      </div>

      <div className="border-1 border-light-green border-round-2xl overflow-hidden">
        <DataTable
          stripedRows
          size="small"
          value={data}
          tableStyle={{ minWidth: "50rem" }}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          globalFilterFields={[
            "firstName",
            "lastName",
            "email",
            "organizationName",
            "organizationState",
            "role",
          ]}
          filters={filters}
          filterDisplay="row"
          pt={{ wrapper: { className: "h-auto" } }}
        >
          {columns.map((col, i) => (
            <Column
              sortable={col.sortable}
              key={col.field}
              field={col.field}
              header={
                <div className="flex justify-content-between font-bold">
                  {col.header}
                </div>
              }
              body={col.body}
              bodyStyle={{ textAlign: "start" }}
              filterField={col.field}
              filter={col.filter}
              filterElement={col.filterElement || defaultFilterTemplate}
              showFilterMenu={false}
              pt={{ headerCell: { className: "py-2" } }}
            />
          ))}
        </DataTable>
      </div>

      <Dialog
        draggable={false}
        header="Edit User"
        visible={visibleEditUser}
        modal
        style={{ width: "50vw" }}
        onHide={() => setVisibleEditUser(false)}
      >
        <AdminEditUser
          user={selectedUser}
          onClose={() => setVisibleEditUser(false)}
          onUpdate={onUpdateUser}
        />
      </Dialog>

      <Toast ref={toast} position="bottom-center" />

      <ConfirmDialog />
    </>
  );
};

export default AdminUserManagement;
