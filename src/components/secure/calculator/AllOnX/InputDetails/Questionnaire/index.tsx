import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "react-query";

import { AUTO_POPULATE_OPTIONS } from "@/constants/calculators";
import {
  AutoPopulateData,
  InputOutputValues,
  Site,
  SiteData,
  ItemData,
  InputDetail,
  ANSWER_TYPE,
  QUESTION_AVAILABILITY,
} from "@/types/calculators";

import Quiz from "../../../quiz";
import ComponentDetails from "../../ComponentDetails";

import AutoPopulatePromt from "./AutoPopulatePromt";
import QuestionNavbar from "./QuestionNavbar";
import useCalculatorsInfo from "@/hooks/useCalculatorsInfo";
import { filterValidAnswers, isEmptyAnswer, isPopup, makeEmptyAnswer, parseItems } from "@/helpers/calculators";
import _ from "lodash";

interface QuestionnaireProps {
  site: Site;
  input: InputOutputValues[];
  option: string;
  showAutoPopulatePrompt: boolean;
  autoPopulateData: AutoPopulateData | null;
  sitesData: SiteData;
  responseOrder: string[];
  onInputSelect: (
    site: Site,
    questions: InputOutputValues[],
    answer: ANSWER_TYPE
  ) => void;
  onAutoPopulate: (dataToPopulate: AutoPopulateData | null) => void;
  onQuizResponse: (
    site: Site,
    response: ItemData[],
    collection: string
  ) => void;
  onUpdateQuantity: (quantity: number, groupId: string) => void;
  onAllAnswered: (site: Site) => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({
  site,
  input,
  option,
  showAutoPopulatePrompt,
  autoPopulateData,
  sitesData,
  responseOrder,
  onInputSelect,
  onAutoPopulate,
  onQuizResponse,
  onUpdateQuantity,
  onAllAnswered,
}) => {
  const [level, setLevel] = useState(0);
  const [answerLevel, setAnswerLevel] = useState(0);
  const [answerOptions, setAnswerOptions] = useState<ANSWER_TYPE[][]>([]);
  const [answers, setAnswers] = useState<ANSWER_TYPE[]>([]);
  const [autoQuestions, setAutoQuestions] = useState<
    InputOutputValues[] | null
  >(null);
  const [autoPopulate, setAutoPopulate] = useState<string>(
    AUTO_POPULATE_OPTIONS[1].value
  );
  const [isAutoPopulatedAnswersChanged, setIsAutoPopulatedAnswersChanged] =
    useState<boolean>(false);
  const [canProceed, setCanProceed] = useState<boolean>(true);
  const toastRef = useRef(null);
  const { calcInfoMap } = useCalculatorsInfo();
  const [questionAvailability, setQuestionAvailability] = useState<Record<string, QUESTION_AVAILABILITY>>({});  // { calculatorType: {colIndex: true/false} }

  const countValidQuestions = useCallback((_questions: InputOutputValues[]) => {
    return _questions.map((q) => questionAvailability[q.calculatorType] && questionAvailability[q.calculatorType][q.colIndex]).filter(flag => flag !== false).length;
  }, [questionAvailability]);

  const sitesCount = Object.keys(sitesData).length;
  useEffect(() => {
    if (showAutoPopulatePrompt) {
      return;
    }

    if (autoPopulateData) {
      const { questions, answerOptions, answers } = autoPopulateData;

      setAnswerOptions(answerOptions);
      setAnswers(answers);
      setAutoQuestions(questions);
      setAnswerLevel(answers.length);

      setLevel(questions.length);
    }
    // else if (sitesCount > 1) {
    //   setAutoQuestions(null);
    //   setLevel(0);
    //   setAnswers([]);
    // }
  }, [autoPopulateData, showAutoPopulatePrompt, sitesCount]);

  const { isLoading } = useQuery(
    [input, level, option, site, canProceed, calcInfoMap],
    async () => {
      if (!canProceed) {
        return;
      }

      if (level >= input.length || autoPopulateData !== null) return;

      let quiz = {} as ANSWER_TYPE;
      const originalAnswerOptions = answerOptions.slice(0, answerLevel);

      const inspectedCalculatorType = input[level].calculatorType;
      const inspectedCalculatorInput =
        calcInfoMap[inspectedCalculatorType].input;
      const inspectedCalculatorOutput =
        calcInfoMap[inspectedCalculatorType].output;
      const inspectedQuestionAvailability = questionAvailability[inspectedCalculatorType] || {};
      let inspectedCalculatorLevel = 0;

      let currentAnswerIndex = 0;
      for (let index = 0; index < level;) {
        if (
          input[index].isCommon ||
          input[index].calculatorType === inspectedCalculatorType
        ) {
          quiz = { ...quiz, ...filterValidAnswers(answers[currentAnswerIndex]) };
          inspectedCalculatorLevel += Object.keys(
            answers[currentAnswerIndex]
          ).length;
        }
        index += Object.keys(answers[currentAnswerIndex]).length;
        currentAnswerIndex += 1;
      }

      // Calculate which inputs to ask in the next step - BEGIN
      let nextInputFields = [], remainingInputFields = [],
        i,
        count = 0, shouldRequest = true;
      for (
        i = level;
        i < input.length &&
        input[i].calculatorType === inspectedCalculatorType;
        ++i
      ) {
        if (isPopup(input[i].groupText) == false) {
          count += 1;
          if (count == 2) break;
          if (inspectedQuestionAvailability[input[i].colIndex] === false) // if this is not POPUP_TEXT question but it's already marked as false in questionAvailability, we needn't fetch the request
            shouldRequest = false;
        }
        nextInputFields.push(input[i].colIndex);
      }
      if (shouldRequest === false) {
        setAnswerOptions([...originalAnswerOptions, [makeEmptyAnswer(nextInputFields)]])
        return;
      }
      for (; i < input.length && input[i].calculatorType === inspectedCalculatorType; ++i)
        if (input[i].colIndex && inspectedQuestionAvailability[input[i].colIndex] !== false)  // only update if the answer for this question is available
          remainingInputFields.push(input[i].colIndex);
      // Calculate which inputs to ask in the next step - END

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_SERVER_URL}/materials`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: encodeURIComponent(inspectedCalculatorType),
              quiz,
              fields:
                inspectedCalculatorLevel < inspectedCalculatorInput.length
                  ? nextInputFields
                  : inspectedCalculatorOutput.map((item) => item.colIndex),
              remainingFields: remainingInputFields
            }),
          }
        );

        if (!response.ok && toastRef.current) {
          response.json().then((res: any) => {
            const msg: string =
              res?.message?.message || res?.message || "Something went wrong";
            (toastRef.current as any).show({
              severity: "error",
              summary: res?.status,
              detail: msg,
              life: 5000,
            });
          });
          return;
        }
        const { data: {
          data: newAnswerOptions,
          questionAvailability: newQuestionAvailability
        } }: {
          data: {
            data: ANSWER_TYPE[],
            questionAvailability: QUESTION_AVAILABILITY
          }
        } =
          await response.json();

        if (inspectedCalculatorLevel == inspectedCalculatorInput.length) {
          onQuizResponse(
            site,
            newAnswerOptions
              .map((item) => parseItems(item, inspectedCalculatorOutput))
              .flat(),
            inspectedCalculatorType
          );
          setAnswerOptions([...originalAnswerOptions, [makeEmptyAnswer([""])]]);
          return;
        }
        // if (newAnswerOptions.length) {
        setQuestionAvailability({
          ...questionAvailability, [inspectedCalculatorType]: {
            ...inspectedQuestionAvailability,
            ...newQuestionAvailability
          }
        });
        setAnswerOptions([...originalAnswerOptions, newAnswerOptions]);
        // }
      } catch (error: any) {
        (toastRef.current as any).show({
          severity: "error",
          summary: error?.status,
          detail: error?.message,
          life: 5000,
        });
      }
    },
    { refetchOnWindowFocus: false, retry: false }
  );

  const questions: InputOutputValues[] = useMemo(() => {
    return autoQuestions || input.slice(0, level + 1);
  }, [input, level, autoQuestions]);

  const handleSelectAnswer = useCallback(
    (value: ANSWER_TYPE) => {
      setCanProceed(true);
      setAutoQuestions(null);

      if (autoPopulate === AUTO_POPULATE_OPTIONS[0].value)
        setIsAutoPopulatedAnswersChanged(true);
      const answeredCounts = Object.keys(value).length;
      setLevel(level + answeredCounts);

      onInputSelect(
        site,
        questions.slice(level, level + answeredCounts),
        value
      );
      setAnswers([...answers.slice(0, answerLevel), value]);
      setAnswerLevel(answerLevel + 1);
    },
    [autoPopulate, questions, site, onInputSelect, answers, answerLevel, level]
  );

  const handleAutoPopulateChange = useCallback(
    (value: string) => {
      setAutoPopulate(value);
      setIsAutoPopulatedAnswersChanged(false);

      if (value === AUTO_POPULATE_OPTIONS[0].value) {
        onAutoPopulate({ site, questions, answerOptions, answers });
      } else {
        onAutoPopulate(null);
      }
    },
    [answerOptions, answers, site, questions, onAutoPopulate]
  );

  const handleChange = useCallback(
    (index: number) => {
      handleAutoPopulateChange(AUTO_POPULATE_OPTIONS[1].value);
      setCanProceed(false);
      let newlevel = 0;
      for (let i = 0; i < index; ++i)
        newlevel += Object.keys(answers[i]).length;
      setLevel(newlevel);
      setAnswerLevel(index);
      setQuestionAvailability({});
    },
    [answers, handleAutoPopulateChange]
  );

  const handleShowSummary = useCallback(() => {
    setLevel(input.length);
  }, [input.length]);

  const quiz = useMemo(() => {
    let result: InputDetail[] = [],
      currentQuestionIndex = 0;
    for (let i = 0; i < answerLevel; ++i) {
      let answeredCounts = Object.keys(answers[i]).length;
      while (answeredCounts > 0) {
        const question = questions[currentQuestionIndex];
        if (answers[i][question.colIndex])
          result.push({
            id: question.isCommon ? "" : question.calculatorType,
            question: question.colName,
            questionText: question.groupText,
            answer: answers[i][question.colIndex],
          });
        answeredCounts -= 1;
        currentQuestionIndex += 1;
      }
    }
    console.log(result);
    return result;
  }, [questions, answers, answerLevel]);

  const answeredAllQuestions = Boolean(
    input.length > 0 && level === input.length
  );

  useEffect(() => {
    if (answeredAllQuestions) onAllAnswered(site);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answeredAllQuestions]);

  const showSummary = level === input.length;

  const showLoader =
    isLoading || (input[level] && !Boolean(answerOptions[answerLevel]?.length));
  const answerOptionsUnavailable = (_.isArray(answerOptions[answerLevel]) && answerOptions[answerLevel]?.length === 1 && isEmptyAnswer(answerOptions[answerLevel][0])) || input[level]?.colName == "";

  useEffect(() => {
    if (!(level < questions.length) || showLoader) return;
    if (
      (answerOptions[answerLevel]?.length === 1 &&
        isEmptyAnswer(answerOptions[answerLevel][0])) ||
      input[level].colName == ""
    ) {
      handleSelectAnswer(answerOptions[answerLevel][0]);
    }
  }, [
    answerOptions,
    answers,
    level,
    input,
    handleSelectAnswer,
    questions.length,
    showLoader,
    answerLevel,
  ]);

  return (
    <div className="mt-3 relative" style={{ minHeight: 700 }}>
      <Toast ref={toastRef} position="top-right" />

      <QuestionNavbar
        questions={input}
        answers={answers}
        isSummaryReady={answeredAllQuestions}
        onShowSummary={handleShowSummary}
        onChange={handleChange}
      />

      {(showLoader || answerOptionsUnavailable) ? (
        <ProgressSpinner
          className="w-1 absolute top-50 left-50"
          style={{ transform: "translate(-50%, -50%)" }}
        />
      ) : (
        <div className="px-4 grid">
          {level < questions.length && (
            <Quiz
              key={`quiz-${level}`}
              question={questions[level]}
              secondaryQuestions={input.slice(
                level,
                level +
                (answerOptions[answerLevel]
                  ? Object.keys(answerOptions[answerLevel][0]).length
                  : 1)
              )}
              calculatorName={calcInfoMap[input[level].calculatorType].label}
              answers={answerOptions[answerLevel]}
              currentAnswer={answers[answerLevel]}
              disabled={showLoader || answerOptionsUnavailable}
              progress={Math.floor(((countValidQuestions(questions) - 1) / countValidQuestions(input)) * 100)}
              onSelectAnswer={handleSelectAnswer}
            />
          )}

          {showAutoPopulatePrompt && answeredAllQuestions && (
            <AutoPopulatePromt
              autoPopulate={autoPopulate}
              onAutoPopulateChange={handleAutoPopulateChange}
              showRefreshButton={isAutoPopulatedAnswersChanged}
            />
          )}

          {answeredAllQuestions &&
            showSummary &&
            sitesData[site.name]?.componentDetails && (
              <ComponentDetails
                quiz={quiz}
                componentDetails={sitesData[site.name]?.componentDetails}
                responseOrder={responseOrder}
                onUpdateQuantity={onUpdateQuantity}
              />
            )}
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
