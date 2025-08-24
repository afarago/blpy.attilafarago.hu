import { useAppDispatch } from '@/app/hooks';
import HubSmall from '@/assets/img/hub-small.svg?react';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Play, Stop, Upload, XCircle } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';
import { selectConversion } from '../conversion/conversionSlice';
import { selectFileContent } from '../fileContent/fileContentSlice';
import { pyblActions } from '../pyblight';
import { getBleState, getHubState } from '../pyblight/selectors';
import { BleStatus } from '../pyblight/slices/ble';
import { CompileInput } from '../pyblight/slices/compile';
import { HubStatus } from '../pyblight/slices/hub';
import { isBluetoothAvailable } from '../pyblight/utils/bluetoothAvailable';
import { selectTabs } from './tabsSlice';

const PyblControls: React.FC = () => {
    const dispatch = useAppDispatch();
    const bleState = useSelector(getBleState);
    const hubState = useSelector(getHubState);
    const isBleConnected = bleState.status === BleStatus.Connected;
    const isUserProgramRunning = hubState.status === HubStatus.Running;
    const { disabledFiles } = useSelector(selectFileContent);
    const { conversionResult } = useSelector(selectConversion);
    const { selectedSubTab } = useSelector(selectTabs);
    const [input, setInput] = useState<CompileInput>([]);

    useEffect(() => {
        if (typeof conversionResult?.pycode === 'string') {
            setInput([{ filename: 'main.py', code: conversionResult.pycode }]);
        } else if (
            Array.isArray(conversionResult?.pycode) &&
            Array.isArray(conversionResult?.name)
        ) {
            const newInput: CompileInput = [];
            for (const [idx, filename] of conversionResult.name.entries()) {
                // check if it is among the disabled files
                if (disabledFiles?.includes(filename)) continue;

                const code = conversionResult.pycode?.[idx];
                const entry = { filename, code };
                if (filename !== selectedSubTab) newInput.push(entry);
                else newInput.unshift(entry);
            }
            setInput(newInput);
        }
    }, [conversionResult, disabledFiles, selectedSubTab]);

    const handlePyblConnect = useCallback(() => {
        if (!isBleConnected) {
            dispatch(pyblActions.connectBle());
        } else {
            dispatch(pyblActions.disconnectBle());
        }
    }, [isBleConnected, dispatch]);

    const handlePyblCompileAndUpload = useCallback(() => {
        if (!isBleConnected || input.length === 0) return;
        dispatch(pyblActions.compileAndUploadAndRun(input));
    }, [input, dispatch, isBleConnected]);

    const handlePyblStartStopUserProgram = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            const start = e.currentTarget.getAttribute('data-start-param') === 'true';
            const slot = 0;
            dispatch(
                start
                    ? pyblActions.startUserProgram(slot)
                    : pyblActions.stopUserProgram(slot),
            );
        },
        [dispatch],
    );

    return (
        isBluetoothAvailable() && (
            <>
                <Button
                    className="mini-button bg-white"
                    title="connect"
                    onClick={handlePyblConnect}
                >
                    {/* rgb(255, 213, 0) */}
                    {isBleConnected ? <XCircle /> : <HubSmall width="16" height="20" />}
                </Button>
                {input?.length && (
                    <Button
                        className="mini-button bg-white"
                        title="compile and upload"
                        onClick={handlePyblCompileAndUpload}
                        disabled={!isBleConnected}
                    >
                        <Upload />
                    </Button>
                )}
                <Button
                    className="mini-button bg-white"
                    title="start or stop the user program"
                    onClick={handlePyblStartStopUserProgram}
                    data-start-param={isUserProgramRunning ? 'false' : 'true'}
                    disabled={!isBleConnected}
                >
                    {isUserProgramRunning ? <Stop /> : <Play />}
                </Button>
            </>
        )
    );
};

export default PyblControls;
