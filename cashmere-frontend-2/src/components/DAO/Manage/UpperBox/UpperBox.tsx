import { InfoIcon } from "../../../../assets/icons";
import LOGOBLACK from "../../../../assets/images/cashmere.png";
import LOGOWHITE from "../../../../assets/images/cashmereWhite.png";
import { LockModal, UnlockModal, UnstakeWarning, Waiting } from "../../../../components";
import { useModal } from "../../../../hooks";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import DatePicker, { DayValue } from "react-modern-calendar-datepicker";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import { useMediaQuery } from "react-responsive";
import { Button, Icon, Input, Modal, Tooltip } from "../../../../ui";
import { clsnm } from "../../../../utils/clsnm";

import styles from "./UpperBox.module.scss";
import { useInjection } from 'inversify-react';
import ThemeStore from '../../../../store/ThemeStore';
import { observer } from 'mobx-react-lite';

enum LOCK {
  "WARNING",
  "SUCCESS",
}

enum WITHDRAW {
  "FORM",
  "WARNING",
  "SUCCESS",
}

const UpperBox = observer(() => {
  const themeStore = useInjection(ThemeStore);
  const [csmValue, setCSMValue] = useState("0");
  const [veCSMValue, setveCSMValue] = useState("0");

  const lockModal = useModal();
  const withdrawModal = useModal();

  const [lockStep, setLockStep] = useState<LOCK>(LOCK.WARNING);
  const [withdrawStep, setWithdrawStep] = useState<WITHDRAW>(WITHDRAW.FORM);

  const isPhoneOrPC = useMediaQuery({
    query: "(max-width: 800px)",
  });

  const [whichTime, setWhichTime] = useState(0);
  const durations = [
    "1 Week",
    "1 Month",
    "3 Month",
    "1 Year",
    "2 Years",
    "4 Years",
  ];

  const date = new Date();
  const [day, setDay] = useState<DayValue>({
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.firstRow}>
        <div className={styles.csm}>
          <div className={styles.title}>BALANCE 23689.905</div>
          <div className={styles.box}>
            <div className={styles.pattern}>
              <img
                className={styles.image}
                src={themeStore.theme === "light" ? LOGOBLACK : LOGOWHITE}
              ></img>
              <div className={styles.text}>CSM</div>
            </div>
            <div className={styles.button}>
              <Button
                width={"45px"}
                height="25px"
                fontSize="fs12"
                fontWeight="fw600"
                color={themeStore.theme === "light" ? "white" : "white"}
              >
                MAX
              </Button>
            </div>
            <div className={styles.input}>
              <Input
                extendLeft
                placeholder="Amount"
                height={isPhoneOrPC ? "55px" : "71px"}
                onChange={(e) => setCSMValue(e.target.value.toString())}
              />
            </div>
          </div>
        </div>
        <div className={styles.veCSM}>
          <div className={styles.title}>INITIAL VECSM </div>
          <div className={styles.box}>
            <div className={styles.pattern}>
              <img
                className={styles.image}
                src={themeStore.theme === "light" ? LOGOBLACK : LOGOWHITE}
              ></img>
              <div className={styles.text}>veCSM</div>
            </div>
            <div className={styles.button}>
              <Button
                width={"45px"}
                height="25px"
                fontSize="fs12"
                fontWeight="fw600"
                color={themeStore.theme === "light" ? "white" : "white"}
              >
                MAX
              </Button>
            </div>
            <div className={styles.input}>
              <Input
                extendLeft
                placeholder="Amount"
                height={isPhoneOrPC ? "55px" : "71px"}
                onChange={(e) => setveCSMValue(e.target.value.toString())}
              />
            </div>
          </div>
        </div>
        <div className={styles.result}>
          <div className={styles.title}>
            AVERAGE LOCK TIME: <span>3.63 YEARS</span>
          </div>
          <div className={styles.buttons}>
            <Button
              width={"100%"}
              height="40px"
              fontWeight="fw600"
              color={
                themeStore.theme === "light" ? "transparentWhite" : "transparentBlack"
              }
              onClick={() => {
                lockModal.open();
              }}
            >
              Lock
            </Button>
            <Button
              width={"100%"}
              height="40px"
              fontWeight="fw600"
              color={
                themeStore.theme === "light" ? "transparentWhite" : "transparentBlack"
              }
              onClick={() => {
                withdrawModal.open();
              }}
            >
              Withdraw
            </Button>
          </div>
        </div>
      </div>
      <div className={styles.secondRow}>
        <div className={styles.optionButtons}>
          {durations.map((duration: string, i: number) => {
            return (
              <div
                key={i}
                onClick={() => setWhichTime(i)}
                className={clsnm(
                  styles.option,
                  whichTime === i && styles.thisOne,
                )}
              >
                {duration}
              </div>
            );
          })}
        </div>
        <div className={styles.customTime}>
          <div className={styles.time}>
            <div className={styles.textt}>
              <div>END DATE: </div>
              <Tooltip placement="top" content="Content coming here">
                <Icon size={16}>
                  <InfoIcon />
                </Icon>
              </Tooltip>
            </div>
            <div className={styles.set}>
              <Calender day={day} setDay={setDay} />
              <span className={styles.icon}>
                <FaChevronDown />
              </span>
            </div>
          </div>
          <div className={styles.text}>Increase Lock</div>
        </div>
      </div>

      {lockStep === LOCK.WARNING ? (
        <LockModal
          modal={lockModal}
          onSuccess={() => setLockStep(LOCK.SUCCESS)}
          day={day}
          csmValue={csmValue}
          veCSMValue={veCSMValue}
        />
      ) : (
        <Modal
          isOpen={lockModal.isOpen}
          close={() => {
            lockModal.close();
            setLockStep(LOCK.WARNING);
          }}
        >
          <Waiting
            value={csmValue}
            iconName={"CSM"}
            icon={null}
            functionName={"Lock"}
          />
        </Modal>
      )}
      {withdrawStep === WITHDRAW.WARNING ? (
        <UnstakeWarning
          modal={withdrawModal}
          onSuccess={() => setWithdrawStep(WITHDRAW.SUCCESS)}
        />
      ) : withdrawStep === WITHDRAW.FORM ? (
        <UnlockModal
          modal={withdrawModal}
          onSuccess={() => setWithdrawStep(WITHDRAW.WARNING)}
        />
      ) : (
        <Modal
          isOpen={withdrawModal.isOpen}
          close={() => {
            withdrawModal.close();
            setWithdrawStep(WITHDRAW.FORM);
          }}
        >
          <Waiting
            value={veCSMValue}
            iconName={"veCSM"}
            icon={null}
            functionName={"Withdraw"}
          />
        </Modal>
      )}
    </div>
  );
});

const Calender = ({ day, setDay }: { day: any; setDay: any }) => {
  const currentDate =
    day?.day.toString() +
    "/" +
    day?.month.toString() +
    "/" +
    day?.year.toString();
  const renderCustomInput = ({ ref }: any) => (
    <input
      readOnly
      ref={ref} // necessary
      placeholder={currentDate}
      value={day ? `${day.day}/${day.month}/${day.year}` : ""}
      className={styles.calender} // a styling class
    />
  );
  return (
    <>
      <DatePicker
        value={day}
        inputPlaceholder={currentDate}
        onChange={setDay}
        renderInput={renderCustomInput}
        calendarClassName={styles.calendarResponsive}
      />
    </>
  );
};

export { UpperBox };
