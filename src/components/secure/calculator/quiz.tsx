import classNames from "classnames/bind";
import orderBy from "lodash/orderBy";
import {
  AutoComplete,
  AutoCompleteChangeEvent,
  AutoCompleteCompleteEvent,
  AutoCompleteSelectEvent,
} from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import React, { useEffect, useState, useMemo } from "react";

import PieChartProgressBar from "@/components/shared/PieChartProgressbar";
import {
  BRAND_IMAGES,
  SHOULD_DISPLAY_TEXT_ONLY,
} from "@/constants/calculators";
import { InputOutputValues } from "@/types/calculators";

import PopupOutput from "./Result/Outputs/Popup";

import styles from "./quiz.module.scss";

const cx = classNames.bind(styles);

interface QuizProps {
  calculatorName?: string;
  question: InputOutputValues;
  currentAnswer: string;
  answers: string[];
  disabled?: boolean;
  progress?: number;
  onGoBack?: () => void;
  onSelectAnswer: (e: string) => void;
}

const Quiz: React.FC<QuizProps> = ({
  calculatorName,
  question,
  currentAnswer,
  answers,
  progress,
  disabled,
  onGoBack,
  onSelectAnswer,
}) => {
  const [searchValue, setSearchVaule] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>("");

  const isActionQuestion = useMemo(() => {
    return question.colName.startsWith("Action");
  }, [question]);

  const filteredAnswers = useMemo(() => {
    return (
      answers?.filter((answer) => answer.includes(selectedSuggestion)) || []
    );
  }, [answers, selectedSuggestion]);

  const questionName = useMemo(() => {
    if (question.colName.endsWith("?")) {
      return question.colName;
    }

    if (question.colName.startsWith("Action")) {
      return `Action: ${answers?.[0] || ""}`;
    }

    return `Select ${question.colName}`;
  }, [question, answers]);

  const options = useMemo(() => {
    const availableOptions =
      filteredAnswers.length > 6
        ? filteredAnswers.slice(0, 6)
        : filteredAnswers;

    if (availableOptions.length === 0) {
      return [];
    }

    if (availableOptions[0].endsWith(" mm")) {
      return orderBy(
        availableOptions,
        (option) => Number(option.split(" ")[0]),
        ["asc"]
      );
    }

    return availableOptions;
  }, [filteredAnswers]);

  const dropdownOptionTemplate = (option: string) => {
    const image = BRAND_IMAGES[String(option).toLowerCase()];

    return (
      <div className="flex align-items-center justify-content-center">
        <div className="w-12 flex align-items-center gap-8 pl-2">
          {image && (
            <Image
              alt={option}
              src={image}
              imageStyle={{ height: 60, width: 160, objectFit: "contain" }}
            />
          )}
          <div>{option}</div>
        </div>
      </div>
    );
  };

  const handleSearchChange = (e: AutoCompleteChangeEvent) => {
    setSearchVaule(e.value);

    if (!e.value) {
      setSelectedSuggestion("");
    }
  };

  const handleAutoCompleteMethod = (e: AutoCompleteCompleteEvent) => {
    const filteredSuggestions = answers
      ?.filter((item) => item.toLowerCase().includes(e.query.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));

    setSuggestions(filteredSuggestions);
  };

  const handleSelect = (e: AutoCompleteSelectEvent) => {
    setSelectedSuggestion(e.value);
  };

  useEffect(() => {
    if (answers && answers.length) {
      setSuggestions(answers?.sort());
    }
  }, [answers]);

  return (
    <>
      <div className="col-12 flex flex-column justify-content-center align-items-center relative">
        {onGoBack && (
          <Button
            icon="pi pi-arrow-left"
            className="absolute left-0 ml-2 mt-5 px-5 md:ml-4 text-6xl bg-light-green"
            disabled={disabled}
            onClick={onGoBack}
          />
        )}

        {calculatorName && <h1 className="underline">{calculatorName}</h1>}
        {suggestions.length > 0 && (
          <h1
            className={cx(
              "heading",
              "flex align-items-center gap-3 text-center"
            )}
          >
            {question.colText && (
              <PopupOutput
                className="text-2xl"
                data={{
                  [SHOULD_DISPLAY_TEXT_ONLY]: question.colText,
                }}
              />
            )}
            {questionName}
          </h1>
        )}
      </div>

      {answers?.length > 6 && (
        <div className="col-12 sm:col-8 sm:col-offset-2 xl:col-4 xl:col-offset-4 md:mb-6">
          <AutoComplete
            value={searchValue}
            suggestions={suggestions}
            onChange={handleSearchChange}
            placeholder="Search all available options..."
            className="w-full"
            inputClassName="w-full"
            completeMethod={handleAutoCompleteMethod}
            onSelect={handleSelect}
            itemTemplate={dropdownOptionTemplate}
            dropdown
          />
        </div>
      )}

      <div className="relative md:absolute flex align-items-center justify-content-center w-full md:w-2 md:col-offset-10">
        <PieChartProgressBar percentage={progress || 0} />
      </div>

      {!disabled && (
        <div className="flex align-items-start justify-content-around flex-wrap w-12">
          {isActionQuestion ? (
            <div
              className="m-2 w-12 md:w-3 flex flex-column"
              onClick={() => {
                if (!disabled) {
                  onSelectAnswer(answers[0]);
                }
              }}
            >
              <div
                className={cx(
                  "quiz-card",
                  "border-3 border-round-xl w-full p-0 flex justify-content-center cursor-pointer"
                )}
                style={{ height: 50 }}
              >
                <div className="w-full m-1 text-3xl flex align-items-center justify-content-center text-center">
                  Next
                </div>
              </div>
            </div>
          ) : (
            <>
              {options.map((answer, index) => {
                const image = BRAND_IMAGES[`${answer}`.toLowerCase()];

                return (
                  <div
                    key={`${question}-${answer}-${index}`}
                    className="m-2 w-12 md:w-3 flex flex-column"
                    onClick={() => {
                      if (!disabled) {
                        onSelectAnswer(answer);
                      }
                    }}
                  >
                    <div
                      className={cx(
                        "quiz-card",
                        "border-3 border-round-xl w-full p-0 flex justify-content-center cursor-pointer",
                        { "quiz-card--selected": currentAnswer === answer }
                      )}
                      style={{ height: 200 }}
                    >
                      {image ? (
                        <Image
                          src={image}
                          width="100%"
                          height="100%"
                          imageClassName="p-4"
                          imageStyle={{ objectFit: "contain" }}
                          alt={answer}
                        />
                      ) : (
                        <div className="w-full m-1 text-3xl flex align-items-center justify-content-center text-center">
                          {answer}
                        </div>
                      )}
                    </div>

                    {image && (
                      <p className="w-full text-3xl text-center">{answer}</p>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Quiz;
