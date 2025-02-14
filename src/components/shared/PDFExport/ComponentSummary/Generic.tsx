import classNames from "classnames/bind";
import trim from "lodash/trim";
import React, { useMemo } from "react";

import { isValidUrl } from "@/helpers/calculators";
import { Summary, TotalQuantities } from "@/types/calculators";

import styles from "../InputSummary/styles.module.scss";
import useCheckMobileScreen from "@/hooks/useCheckMobileScreen";

const cx = classNames.bind(styles);

interface GenericComponentSummaryProps {
  summary: Summary[];
  totalQuantities: TotalQuantities[];
}

const GenericComponentSummary: React.FC<GenericComponentSummaryProps> = ({
  summary,
  totalQuantities,
}) => {
  const isMobile = useCheckMobileScreen();

  const showManufacturer = useMemo(() => {
    return summary.some(
      (item) =>
        item.manufacturer && item.brand && item.manufacturer !== item.brand
    );
  }, [summary]);

  const showNumber = useMemo(() => {
    return summary.some((item) => item.itemNumber !== undefined);
  }, [summary]);

  const columns = [
    "Name",
    "Number",
    showManufacturer ? "Manufacturer" : "",
    showNumber ? "Quantity" : "",
  ].filter(Boolean);

  if (!isMobile) {
    return (
      <table className={cx("striped-table")}>
        <thead>
          <tr>
            {columns.map((columnName) => (
              <th key={columnName}>{columnName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {summary.map((data, summaryIdx) => {
            const indexOfItem = totalQuantities.findIndex(
              (item) => item.id === data.id
            );
            const quantity =
              indexOfItem !== -1
                ? totalQuantities[indexOfItem].quantity
                : data.quantity;
            const link = trim(data.link);

            return (
              <tr
                key={`${data.description}-${summaryIdx}`}
                className={cx(summaryIdx % 2 === 0 ? "even" : "odd")}
              >
                <td>
                  {isValidUrl(link) ? (
                    <a href={link} target="_blank" className="text-light-green">
                      {data.itemName}
                    </a>
                  ) : (
                    data.itemName
                  )}
                </td>
                {showNumber && <td>{data.itemNumber}</td>}
                {showManufacturer && (
                  <td>
                    {data.manufacturer &&
                    data.brand &&
                    data.manufacturer !== data.brand
                      ? data.manufacturer
                      : ""}
                  </td>
                )}
                <td>{quantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <table className={cx("striped-table")}>
      {columns.map((columnName) => (
        <tr key={columnName}>
          <th>{columnName}</th>
          {summary.map((data, summaryIdx) => {
            const indexOfItem = totalQuantities.findIndex(
              (item) => item.id === data.id
            );
            const quantity =
              indexOfItem !== -1
                ? totalQuantities[indexOfItem].quantity
                : data.quantity;
            const link = trim(data.link);
            return (
              <td
                key={`${data.description}-${summaryIdx}`}
                className={cx(summaryIdx % 2 === 0 ? "even" : "odd")}
              >
                {columnName === "Name" &&
                  (isValidUrl(link) ? (
                    <a href={link} target="_blank" className="text-light-green">
                      {data.itemName}
                    </a>
                  ) : (
                    data.itemName
                  ))}
                {columnName === "Number" && showNumber && data.itemNumber}
                {columnName === "Manufacturer" &&
                  showManufacturer &&
                  (data.manufacturer &&
                  data.brand &&
                  data.manufacturer !== data.brand
                    ? data.manufacturer
                    : "")}
                {columnName === "Quantity" && quantity}
              </td>
            );
          })}
        </tr>
      ))}
    </table>
  );
};

export default GenericComponentSummary;
