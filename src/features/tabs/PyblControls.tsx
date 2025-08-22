import { useAppDispatch } from '@/app/hooks';
import HubSmall from '@/assets/img/hub-small.svg?react';
import React, { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { Bluetooth, Play, Stop, Upload, XCircle } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';
import { selectConversion } from '../conversion/conversionSlice';
import { pyblActions } from '../pyblight';
import { getBleState, getHubState } from '../pyblight/selectors';
import { BleStatus } from '../pyblight/slices/ble';
import { HubStatus } from '../pyblight/slices/hub';

const PyblControls: React.FC = () => {
    const dispatch = useAppDispatch();
    const bleState = useSelector(getBleState);
    const hubState = useSelector(getHubState);
    const isBleConnected = bleState.status === BleStatus.Connected;
    const isUserProgramRunning = hubState.status === HubStatus.Running;
    const { conversionResult } = useSelector(selectConversion);
    const pycode = conversionResult?.pycode
        ? Array.isArray(conversionResult.pycode)
            ? conversionResult.pycode.join('\n')
            : conversionResult.pycode
        : undefined;

    const handlePyblConnect = useCallback(() => {
        if (!isBleConnected) {
            dispatch(pyblActions.connectBle());
        } else {
            dispatch(pyblActions.disconnectBle());
        }
    }, [isBleConnected]);

    const handlePyblCompileAndUpload = useCallback(() => {
        dispatch(pyblActions.compileAndUploadAndRun(pycode || ''));
    }, []);

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
        [],
    );

    return (
        <>
            <Button
                className="mini-button bg-white"
                title="connect"
                onClick={handlePyblConnect}
            >
                {/* rgb(255, 213, 0) */}
                {isBleConnected ? <XCircle /> : <HubSmall width="16" height="20" />}
            </Button>
            {pycode && (
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
    );
};

export default PyblControls;
