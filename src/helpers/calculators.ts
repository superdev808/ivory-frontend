import cloneDeep from "lodash/cloneDeep";
import findIndex from "lodash/findIndex";
import find from "lodash/find";
import get from "lodash/get";
import union from "lodash/union";
import uniqBy from "lodash/uniqBy";

import {
  CALCULATOR_OUTPUT_MAPPING,
  DENTAL_IMPLANT_PROCEDURE_OPTIONS,
  MATERIAL_CALCULATOR_TYPES,
  MUA_OPTIONS,
  PROCEDURE_INPUTS_AND_RESPONSE,
  QUANTITY_MULTIPLES_LIST,
} from "@/constants/calculators";
import {
  CalculatorInfoMap,
  InputAndResponse,
  InputDetail,
  InputOutputValues,
  ItemData,
  ItemInsights,
  KeyValuePair,
  PROCEDURE,
  Patient,
  SiteData,
  Summary,
} from "@/types/calculators";

export const isValidUrl = (urlString = "") => {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // validate fragment locator
  return Boolean(urlPattern.test(urlString.trim()));
};

const getRestorativeCollections = (
  additionalInputs: KeyValuePair
): string[] => {
  // Restorative (Direct to Implant)
  if (
    additionalInputs[DENTAL_IMPLANT_PROCEDURE_OPTIONS[0].name] ===
    DENTAL_IMPLANT_PROCEDURE_OPTIONS[0].value
  ) {
    return PROCEDURE_INPUTS_AND_RESPONSE.RESTORATIVE_DIRECT_TO_IMPLANT;
  }
  // Restorative (On MUAs, MUAs Not Placed)
  if (
    additionalInputs[DENTAL_IMPLANT_PROCEDURE_OPTIONS[0].name] ===
      DENTAL_IMPLANT_PROCEDURE_OPTIONS[1].value &&
    additionalInputs[MUA_OPTIONS[0].name] === MUA_OPTIONS[1].value
  ) {
    return PROCEDURE_INPUTS_AND_RESPONSE.RESTORATIVE_ON_MUAS_MUAS_NOT_PLACED;
  }
  // Restorative (On MUAs, MUAs Placed)
  if (
    additionalInputs[DENTAL_IMPLANT_PROCEDURE_OPTIONS[0].name] ===
      DENTAL_IMPLANT_PROCEDURE_OPTIONS[1].value &&
    additionalInputs[MUA_OPTIONS[0].name] === MUA_OPTIONS[0].value
  ) {
    return PROCEDURE_INPUTS_AND_RESPONSE.RESTORATIVE_ON_MUAS_MUAS_PLACED;
  }
  // No match found
  return [];
};

export const getProcedureCollections = (
  calcInfoMap: CalculatorInfoMap,
  procedure: PROCEDURE,
  additionalInputs: KeyValuePair,
  isCustom: boolean
) => {
  let collections: string[] = [];

  if (!isCustom) {
    switch (procedure) {
      case PROCEDURE.SURGERY:
        collections = PROCEDURE_INPUTS_AND_RESPONSE.SURGERY;
        break;

      case PROCEDURE.RESTORATIVE:
        collections = getRestorativeCollections(additionalInputs);
        break;

      case PROCEDURE.SURGERY_AND_RESTORATIVE:
        collections = union([
          ...PROCEDURE_INPUTS_AND_RESPONSE.SURGERY,
          ...getRestorativeCollections(additionalInputs),
        ]);
        break;

      default:
        break;
    }
  } else {
    collections = Object.keys(calcInfoMap);
  }

  return collections.sort();
};

export const getProcedureInputsAndResponse = (
  calcInfoMap: CalculatorInfoMap,
  selectedCollections: string[]
): InputAndResponse => {
  let inputs: InputOutputValues[] = [];
  let responseOrder: string[] = [];

  selectedCollections.map((selectedCollection: string) => {
    calcInfoMap[selectedCollection].input.map((input) => {
      const filteredInputs: InputOutputValues[] = inputs.filter(
        (item: InputOutputValues) =>
          item.colName && item.colName === input.colName
      );
      if (
        filteredInputs.length <= 0 ||
        (filteredInputs.length && !filteredInputs[0].isCommon)
      )
        inputs = [...inputs, input];
    });
    responseOrder.push(selectedCollection);
  });

  return { input: inputs, responseOrder };
};

export const getComponentSummary = (
  sitesData: SiteData,
  responseOrder: string[]
): Summary[] => {
  const items: ItemData[] = [];

  const brand =
    find(
      get(Object.values(sitesData), "0.inputDetails"),
      (item: InputDetail) => item.question === "Implant Brand"
    )?.answer || "";

  console.log("Before Summary Data:", sitesData, responseOrder);

  Object.keys(sitesData).forEach((siteName) => {
    const componentDetail = cloneDeep(sitesData[siteName].componentDetails);

    responseOrder.forEach((calculatorType) => {
      componentDetail[calculatorType]?.forEach((response) => {
        response.info.forEach((info, index) => {
          let newInfo: ItemInsights = { id: info.id, quantity: info.quantity };
          Object.keys(info).forEach((key) => {
            let i,
              { colName, groupId, groupText } = deserializeColInfo(key);
            for (let i = 0; i < CALCULATOR_OUTPUT_MAPPING.length; ++i)
              if (CALCULATOR_OUTPUT_MAPPING[i][1].test(groupText) || CALCULATOR_OUTPUT_MAPPING[i][1].test(colName)) {
                newInfo[CALCULATOR_OUTPUT_MAPPING[i][0]] = info[key];
                if (/name/gi.test(key)) newInfo.description = colName;
                break;
              }
            if (i == CALCULATOR_OUTPUT_MAPPING.length) newInfo[key] = info[key];
          });
          response.info[index] = newInfo;
        });
      });
    });

    responseOrder.forEach((calculatorType) => {
      if (MATERIAL_CALCULATOR_TYPES.includes(calculatorType)) {
        componentDetail[calculatorType]?.forEach((response) => {
          items.push(response);
        });

        return;
      }

      componentDetail[calculatorType]?.forEach((response) => {
        const itemIndex = findIndex(items, (item) => item.id === response.id);

        if (itemIndex > -1) {
          items[itemIndex].info.forEach((info, i) => {
            const indexOfInfo = response.info.findIndex(
              (res) => info.id === res.id && info.link === res.link
            );

            if (indexOfInfo > -1) {
              if (
                QUANTITY_MULTIPLES_LIST.includes(
                  response.label.toLowerCase()
                ) &&
                items[itemIndex].info[i].quantity
              ) {
                items[itemIndex].info[i].quantity =
                  (items[itemIndex].info[i].quantity as number) + 1;
              }
            } else {
              items[itemIndex].info = uniqBy(
                [...items[itemIndex].info, ...response.info],
                "id"
              );
            }
          });

          if (items[itemIndex].info.length !== response.info.length) {
            items[itemIndex].info = uniqBy(
              [...items[itemIndex].info, ...response.info],
              "id"
            );
          }
        } else {
          items.push(response);
        }
      });
    });
  });

  const summaryData = items.flatMap(
    (category: ItemData) => category.info as Summary[]
  );

  console.log("After Summary Data:", summaryData);

  return summaryData;
};

export const prepareExportProps = (
  calculatorType: string,
  calculatorName: string,
  patientInfo: Patient,
  quiz: InputDetail[],
  items: ItemData[]
) => {
  const componentDetails = {
    [calculatorType]: items,
  };

  const sitesData = {
    "Site 1": {
      inputDetails: quiz,
      componentDetails,
    },
  };

  const componentSummary = getComponentSummary(sitesData, [calculatorType]);

  return {
    inputSummary: [{ name: "Site 1", inputDetails: quiz, componentDetails }],
    componentSummary,
    calculatorType,
    calculatorName,
    patientInfo,
    showTeethSelection: false,
    hideSite: true,
    totalQuantities: [],
  };
};

export const serializeColInfo = (
  colInfo: Pick<
    InputOutputValues,
    "colName" | "groupText" | "groupId" | "calculatorType"
  >
) => {
  return `${colInfo.groupText || "EMPTY"}___${colInfo.colName}___${
    colInfo.groupId
  }___${colInfo.calculatorType}`;
};

export const deserializeColInfo = (serializedColInfo: string) => {
  const [groupText, colName, groupId, calculatorType] =
    serializedColInfo.split("___");
  return {
    groupText: groupText == "EMPTY" ? "" : groupText,
    colName,
    groupId,
    calculatorType,
  };
};

export const parseItems = (
  item: Record<string, string>,
  outputCalcInfo: InputOutputValues[]
): ItemData[] => {
  const findColumnFromColIndex = (colIndex: string) =>
    outputCalcInfo.find((item) => item.colIndex == colIndex);

  let resultInfo: ItemData[] = [],
    i,
    j;
  let columnInfos = Object.keys(item)
    .map((colIndex) => findColumnFromColIndex(colIndex))
    .sort((left, right) => {
      let leftGroupId = left?.groupId || "",
        rightGroupId = right?.groupId || "";
      return leftGroupId == rightGroupId
        ? 0
        : leftGroupId < rightGroupId
        ? -1
        : 1;
    }) as InputOutputValues[];
  for (i = 0; i < columnInfos.length; i = j) {
    let newItem: ItemData = {
      id: `${columnInfos[i].groupId} (${columnInfos[i].calculatorType})`,
      label: columnInfos[i].groupName,
      info: [],
    };
    let newInfo: ItemInsights = { id: columnInfos[i].groupId, quantity: 1 };

    for (
      j = i;
      j < columnInfos.length &&
      columnInfos[i].groupId == columnInfos[j].groupId;
      ++j
    ) {
      let showText = serializeColInfo(columnInfos[j]);
      newInfo[showText] = item[columnInfos[j].colIndex];
    }
    newItem.info.push(newInfo);

    resultInfo.push(newItem);
  }
  return resultInfo;
};
