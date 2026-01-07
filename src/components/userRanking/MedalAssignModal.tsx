import {useEffect, useState} from 'react';
import {Modal, Button} from 'react-bootstrap';
import {toast} from 'react-toastify';
import medalApi from '../../api/medalApi';
import Loading from '../common/Loading';
import { Medal } from '../../types/medal';

interface MedalAssignModalProps {
  show: boolean;
  onHide: () => void;
  selectedUserCount: number;
  onAssign: (medalId: number) => void;
}

const MedalAssignModal = ({show, onHide, selectedUserCount, onAssign}: MedalAssignModalProps) => {
  const [medals, setMedals] = useState<Medal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedalId, setSelectedMedalId] = useState<number | null>(null);

  useEffect(() => {
    if (show) {
      fetchMedals();
    }
  }, [show]);

  const fetchMedals = async () => {
    setIsLoading(true);
    try {
      const response = await medalApi.getMedals();
      if (response.ok && response.data) {
        setMedals(response.data.contents);
      } else {
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = () => {
    if (!selectedMedalId) {
      toast.warning('메달을 선택해주세요.');
      return;
    }

    onAssign(selectedMedalId);
  };

  const handleClose = () => {
    setSelectedMedalId(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-award-fill me-2 text-warning"></i>
          메달 지급
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <div className="alert alert-info d-flex align-items-center">
            <i className="bi bi-info-circle-fill me-2"></i>
            <span>선택한 <strong>{selectedUserCount}명</strong>의 유저에게 메달을 지급합니다.</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <Loading/>
            <p className="text-muted mt-3">메달 목록을 불러오는 중입니다</p>
          </div>
        ) : medals.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox display-1 text-muted mb-3"></i>
            <p className="text-muted">메달이 없습니다</p>
          </div>
        ) : (
          <div className="row g-3">
            {medals.map((medal) => (
              <div key={medal.medalId} className="col-md-6">
                <div
                  className={`card h-100 cursor-pointer ${selectedMedalId === medal.medalId ? 'border-primary border-2' : ''}`}
                  onClick={() => setSelectedMedalId(medal.medalId)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: selectedMedalId === medal.medalId ? '#e7f3ff' : 'white'
                  }}
                >
                  <div className="card-body d-flex align-items-center gap-3">
                    <div className="position-relative">
                      <img
                        src={medal.iconUrl}
                        alt={medal.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'contain'
                        }}
                      />
                      {selectedMedalId === medal.medalId && (
                        <div
                          className="position-absolute top-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center"
                          style={{width: '24px', height: '24px', marginTop: '-8px', marginRight: '-8px'}}
                        >
                          <i className="bi bi-check text-white"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-bold">{medal.name}</h6>
                      <p className="text-muted small mb-0">{medal.introduction}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          취소
        </Button>
        <Button
          variant="primary"
          onClick={handleAssign}
          disabled={!selectedMedalId}
        >
          <i className="bi bi-award-fill me-2"></i>
          메달 지급
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MedalAssignModal;
