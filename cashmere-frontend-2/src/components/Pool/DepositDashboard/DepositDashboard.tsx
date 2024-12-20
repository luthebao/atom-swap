import { Waiting } from "../../../components";
import { useModal } from "../../../hooks";
import { Modal } from "../../../ui";

import styles from "./DepositDashboard.module.scss";
import { useInjection } from 'inversify-react';
import ThemeStore from '../../../store/ThemeStore';
import { observer } from 'mobx-react-lite';
import Big from 'big.js';
import { formatValue } from '../../../utils/formatValue';

const DepositDashboard = observer(({ myDepositsSum }: { myDepositsSum: Big }) => {
  const claimModal = useModal();
  const themeStore = useInjection(ThemeStore);
  return (
    <div className={styles.wrapper}>
      <div className={styles.rewardWrapper}>
        <div className={styles.DBTexts}>
          <div className={styles.DBText}>
            <span className={styles.name}>My Total Deposits </span>
            <span className={styles.text2}>${formatValue(myDepositsSum.toString())}</span>
          </div>
          <div className={styles.DBText}>
            <div className={styles.name}>My Pending Rewards</div>
            <div className={styles.text2}>
              -  {/*<span>CSM</span>*/}
            </div>
          </div>
        </div>
        <div className={styles.buttons}>
          {/* <NetworkBadge label={ethereum.id} className={styles.network}/> */}
          {/*<SelectNetwork style={{ height: "40px" }} />*/}
          {/*<Button*/}
          {/*  height="40px"*/}
          {/*  width="156px"*/}
          {/*  fontSize="fs16"*/}
          {/*  onClick={() => claimModal.open()}*/}
          {/*  color={themeStore.theme === "light" ? "black" : "white"}*/}
          {/*  className={clsnm(styles.claimAll)}*/}
          {/*  disabled*/}
          {/*>*/}
          {/*  Claim All*/}
          {/*</Button>*/}
        </div>
        <Modal
          bodyProps={{
            style: {
              borderRadius: "16px",
            },
          }}
          isOpen={claimModal.isOpen}
          close={claimModal.close}
        >
          <Waiting
            icon={null}
            value="24.689.905"
            iconName="veCSM"
            functionName="Claim rewards"
          />
        </Modal>
      </div>
    </div>
  );
});

export { DepositDashboard };
