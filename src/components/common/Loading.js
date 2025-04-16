import React from 'react';
import {Spinner as BootstrapSpinner} from 'react-bootstrap';

export default function Loading({loading = false, children}) {
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center bg-light min-vh-100">
                <div className="bg-white rounded shadow-sm p-5 text-center">
                    <BootstrapSpinner animation="border" role="status" variant="primary"/>
                    <div className="mt-3">로딩 중...</div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
