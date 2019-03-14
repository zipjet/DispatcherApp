import ScanContainer from "../../screens/Scan";

export class ScannerHolder {
    static scanner: ScanContainer

    static setScanner(scanner: ScanContainer) {
        this.scanner = scanner
    }

    static showScanner() {
        this.scanner.getWrappedInstance().resumeScanning();
    }

    static hideScanner() {
        this.scanner.getWrappedInstance().pauseScanning();
    }
}