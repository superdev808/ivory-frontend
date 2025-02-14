"use client";

import classNames from "classnames/bind";

import styles from "@/components/secure/settings/Settings.module.scss";

import SettingsUserInfoForm from "./SettingsUserInfoForm";

const cx = classNames.bind(styles);

const SettingsContainers: React.FC = () => (
  <div className="container flex justify-content-center">
    <div className={cx("settings", "wrapper mt-4 p-0 justify-content-center")}>
      <SettingsUserInfoForm />
    </div>
  </div>
);

export default SettingsContainers;
