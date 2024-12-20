import { Footer, Navbar, SwapBox } from '../../components';
import { GasEstimatorModal } from '../../components';
import { getMockEstimations } from '../../constants/mockEstimateData';
import { useModal } from '../../hooks';
import { useTitle } from '../../hooks/useTitle';
import { useEffect, useState } from 'react';
import { Token } from '../../types/token';
import { Layout } from '../../ui';

import { useSwapSettings } from '../../components/SwapSettings/useSwapSettings';

import styles from './Swap.module.scss';
import { activeChains, Chain } from '../../constants/chains';
import { watchNetwork } from '@wagmi/core';
import { useNetwork } from 'wagmi';

export type SwapState = {
    fromChain: Chain;
    fromToken: Token;
    toChain: Chain;
    toToken: Token;
    fromAmount: string;
};

const Swap = () => {
    useTitle('Swap');
    const { chain } = useNetwork();

    const swapSettings = useSwapSettings();
    const [state, setState] = useState<SwapState>({
        fromAmount: '',
        fromChain: activeChains[0],
        fromToken: activeChains[0].tokenList[0],
        toChain: activeChains[1],
        toToken: activeChains[1].tokenList[0],
    });

    const estimateModal = useModal();

    useEffect(() => {
        if (!chain)
            return;
        if (chain?.id !== state.fromChain.id && !chain.unsupported) {
            const sameToChain = chain.id === state.toChain.id;
            setState({
                ...state,
                fromChain: chain as Chain,
                fromToken: (chain as Chain).tokenList[0],
                toChain: sameToChain ? state.fromChain : state.toChain,
                toToken: sameToChain ? state.fromToken : state.toToken,
            });
        }
    }, [chain]);

    return (
        <Layout>
            <Navbar />
            <div className={styles.wrapper}>
                <SwapBox
                    state={state}
                    setState={setState}
                    swapSettings={swapSettings}
                />
            </div>
            <div onClick={estimateModal.open} className={styles.estimator}>
                <span>Estimate transfer gas fees</span>
            </div>
            <GasEstimatorModal
                modalController={estimateModal}
                estimates={getMockEstimations()}
            />
            <Footer />
        </Layout>
    );
};

export { Swap };
