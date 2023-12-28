import { TabPanel, TabView } from "primereact/tabview";
import {
  Site,
  SiteData,
  InputDetail,
  PROCEDURES,
  ALLONX_REQUEST_PARAMS,
  ProcedureRequest,
} from "../constants";
import React from "react";
import Inputs from "./Inputs";
import { LABEL_ALL_ON_X_CALCULATOR } from "@/app/calculators/constants";

interface InputDetailsProps {
  procedure: PROCEDURES;
  selectedSites: Site[];
  sitesData: SiteData;
  onInputSelect: (site: Site, question: string, answer: string) => void;
  onAutopopulate: () => void;
}

const InputDetails: React.FC<InputDetailsProps> = ({
  procedure,
  selectedSites,
  sitesData,
  onInputSelect,
  onAutopopulate
}: InputDetailsProps) => {
  const requestParams: ProcedureRequest = ALLONX_REQUEST_PARAMS[procedure];  

  return (
    <TabView renderActiveOnly={false} scrollable>
      {selectedSites.map((site: Site, index: number) => {
        return (
          <TabPanel key={site.name} header={site.name}>
            <Inputs
              procedure={procedure}
              site={site}
              input={requestParams.input}
              output={requestParams.output}
              option={LABEL_ALL_ON_X_CALCULATOR}
              onInputSelect={onInputSelect}
              showAutopopulatePrompt={index === 0}
              onAutopopulate={onAutopopulate}
            />
          </TabPanel>
        );
      })}
      <TabPanel header="Summary">
        {selectedSites.map((site: Site) => {
          const questionnaire: InputDetail[] =
            sitesData[site.name]?.inputDetails || [];
          return (
            <React.Fragment key={site.name}>
              <h3>{site.name}</h3>
              {questionnaire.map((data: InputDetail) => {
                return (
                  <div className="flex my-2" key={data.id}>
                    <span className="flex-1">{data.question}</span>
                    <span className="flex-1">{data.answer}</span>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </TabPanel>
    </TabView>
  );
};

export default InputDetails;
