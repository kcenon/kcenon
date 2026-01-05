/**
 * Portfolio Data - Inline JavaScript Data
 * This file contains all portfolio data to work without a server (file:// protocol)
 */

window.PortfolioData = {
  projects: {
  "featured": [
    {
      "id": "smartdent-v3",
      "icon": "hospital",
      "company": "주식회사 레이",
      "title": "SMARTDent v3",
      "period": "2019.01 - 2020.06",
      "roles": ["architect", "lead", "qa-doc"],
      "description": "치과 CT/X-Ray 장비를 위한 통합 의료 영상 플랫폼. <strong>마이크로서비스 아키텍처</strong> 설계, 영상 취득 소프트웨어, DICOM 2D/3D 시각화 소프트웨어를 개발. <strong>ISO 13485</strong> 인증을 위한 검증 문서 직접 작성.",
      "tags": ["C++14", "C#", "WPF", "DICOM", "PostgreSQL", "ISO 13485", "IEC 62304", "DCMTK", "PACS"],
      "expanded": {
        "roles": [
          "전체 시스템 아키텍처 설계 및 기술 의사결정",
          "개발팀 리딩 및 코드 리뷰",
          "IEC 62304 기반 소프트웨어 개발 프로세스 수립"
        ],
        "challenges": [
          "대용량 의료 영상 실시간 처리 (CT 볼륨 데이터 1GB+)",
          "레거시 모놀리식 시스템의 마이크로서비스 전환",
          "다양한 모달리티 장비와의 DICOM 호환성 확보"
        ],
        "solutions": [
          "비동기 I/O 및 멀티스레드 파이프라인으로 처리량 2배 향상",
          "PostgreSQL 분산 데이터 저장소 설계 및 Database Gateway 구축",
          "Database Gateway를 통한 데이터 암호화/복호화 및 네트워크 전체 시스템 자동 상태 동기화",
          "DCMTK 라이브러리 커스터마이징으로 호환성 문제 해결"
        ],
        "certifications": ["CE", "FDA 510(k)", "KFDA", "CCC"]
      }
    },
    {
      "id": "samsung-ct",
      "icon": "microscope",
      "company": "주식회사 레이 → Samsung",
      "title": "Medical CT Project for Samsung",
      "period": "2012.11 - 2014.01",
      "roles": ["architect", "core-dev"],
      "description": "삼성전자 CT/MR 제품을 위한 <strong>DICOM 소프트웨어 플랫폼</strong> 개발. 데이터베이스 서버와 PACS 네트워크 서버(C-STORE/C-FIND/C-MOVE)의 클래스 계층 구조를 설계하고, 처리량 <strong>2배 향상</strong> 달성.",
      "tags": ["C++11", "Boost", "PostgreSQL", "DCMTK", "PACS", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": [
          "DICOM 플랫폼 아키텍처 설계",
          "데이터베이스 스키마 및 쿼리 최적화",
          "PACS 네트워크 서버 핵심 모듈 개발"
        ],
        "challenges": [
          "대용량 CT/MR 영상 데이터의 고속 저장 및 검색",
          "기존 PACS 시스템 대비 성능 2배 향상 요구사항",
          "다양한 DICOM Conformance 요구사항 충족"
        ],
        "solutions": [
          "PL/SQL 기반 최적화된 저장 프로시저 설계",
          "C++ Boost 라이브러리 활용한 고성능 네트워크 처리",
          "계층적 클래스 구조로 확장성 있는 DICOM 서비스 구현"
        ],
        "achievements": [
          "삼성전자 CT/MR 제품군에 탑재",
          "글로벌 시장 출시 성공"
        ]
      }
    }
  ],
  "medicalImaging": [
    {
      "id": "alpha-project",
      "company": "주식회사 레이",
      "title": "Alpha Project",
      "period": "2011.01 - 2012.10",
      "roles": ["architect", "lead", "core-dev"],
      "description": "치과 CT/X-Ray 취득 및 DICOM 2D/3D 시각화 소프트웨어. <strong>DirectX Shader(HLSL)</strong> 기반 이미지 처리 모듈 개발.",
      "tags": ["C#", "WPF", "DirectX", "PostgreSQL", "ClearCanvas", "PACS", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": [
          "전체 시스템 아키텍처 설계 및 기술 의사결정",
          "개발팀 리딩 및 코드 리뷰",
          "IEC 62304 기반 소프트웨어 개발 프로세스 수립",
          "GPU 가속 이미지 처리 파이프라인 설계",
          "HLSL 셰이더 프로그래밍",
          "실시간 영상 렌더링 최적화"
        ],
        "certifications": ["CE", "FDA", "KFDA"]
      }
    },
    {
      "id": "dicom-visualization",
      "company": "주식회사 레이",
      "title": "Visualization Software for DICOM",
      "period": "2010.02 - 2010.12",
      "roles": ["architect", "core-dev", "qa-doc"],
      "description": "DICOM 2D/3D 시각화 소프트웨어. WPF 기반 프레임워크 및 이미지 처리 모듈 개발. 의료기기 검증 문서 작성.",
      "tags": ["C++11", "C#", "MFC", "MSSQL", "ClearCanvas", "PACS", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": [
          "전체 시스템 아키텍처 설계 및 기술 의사결정",
          "개발팀 리딩 및 코드 리뷰",
          "IEC 62304 기반 소프트웨어 개발 프로세스 수립",
          "WPF 기반 뷰어 프레임워크 개발",
          "이미지 처리 알고리즘 구현"
        ],
        "certifications": ["CE", "FDA", "KFDA"]
      }
    },
    {
      "id": "3d-visualization",
      "company": "주식회사 레이",
      "title": "3D Visualization Software",
      "period": "2014.01 - 2015.06",
      "roles": ["core-dev"],
      "description": "DICOM 3D 뷰어 개발. C#, WPF 기반 3D 엔진 활용.",
      "tags": ["C#", "WPF", "OpenGL", "ClearCanvas", "PACS", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": [
          "3D 볼륨 렌더링 엔진 통합",
          "MPR(Multi-Planar Reconstruction) 뷰어 개발",
          "3D 측정 도구 구현"
        ],
        "certifications": ["CE", "FDA", "KFDA", "CCC"]
      }
    },
    {
      "id": "automation-alignment",
      "company": "주식회사 레이",
      "title": "Automation Alignment Software",
      "period": "2015.07 - 2016.04",
      "roles": ["architect", "core-dev", "qa-doc"],
      "description": "의료기기 자동 정렬 소프트웨어. <strong>DirectX Shader(HLSL)</strong> 기반 영상 처리. ISO 13485 검증 문서 작성.",
      "tags": ["C#", "WPF", "DirectX", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": [
          "영상 정합 알고리즘 설계",
          "GPU 기반 실시간 처리 구현",
          "IEC 62304 검증 문서 작성"
        ],
        "certifications": ["CE", "FDA", "KFDA"]
      }
    },
    {
      "id": "intraoral-sensor-sdk",
      "company": "주식회사 레이",
      "title": "Intraoral Sensor SDK",
      "period": "2015.01 - 2015.06",
      "roles": ["architect", "core-dev"],
      "description": "구강 내 센서용 SDK 및 TWAIN 드라이버 개발. C++, Boost 기반 SDK와 C#, WPF 기반 이미징 뷰어.",
      "tags": ["C++14", "C#", "SDK", "TWAIN", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": [
          "센서 하드웨어 인터페이스 SDK 설계",
          "TWAIN 호환 드라이버 개발",
          "3rd party 연동 API 문서 작성"
        ],
        "certifications": ["CE", "FDA", "KFDA"]
      }
    },
    {
      "id": "implagraphy",
      "company": "바텍 VATECH",
      "title": "Implagraphy Project",
      "period": "2005.08 - 2005.11",
      "roles": ["core-dev", "qa-doc"],
      "description": "치과 CT/X-Ray 취득 소프트웨어. 이미지 처리 모듈, DICOM 데이터 핸들링, 의료기기 검증 문서 작성.",
      "tags": ["C++", "MFC", "RS232", "DICOM", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": [
          "이미지 처리 알고리즘 개발",
          "RS232 시리얼 통신 구현",
          "DICOM 데이터 핸들러 개발"
        ],
        "certifications": ["CE", "FDA", "KFDA"]
      }
    },
    {
      "id": "sherpa",
      "company": "바텍 VATECH",
      "title": "Sherpa Project",
      "period": "2008.01 - 2009.07",
      "roles": ["core-dev", "qa-doc"],
      "description": "치과 CT/X-Ray 취득 및 치과 영상 시각화 소프트웨어. 차트 관리자, 카메라/프린터/스캐너 모듈, TCP/IP 통신 개발.",
      "tags": ["C#", "WPF", "DirectShow", "LINQ", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": [
          "전체 소프트웨어 아키텍처 설계",
          "DirectShow 기반 카메라 모듈 개발",
          "TCP/IP 기반 장비 통신 프로토콜 설계"
        ],
        "certifications": ["CE", "FDA", "KFDA"]
      }
    }
  ],
  "orthodontic": [
    {
      "id": "ezceph",
      "company": "바텍 VATECH",
      "title": "EzCeph Project",
      "period": "2004.07 - 2005.12",
      "roles": ["core-dev", "qa-doc"],
      "description": "교정 시뮬레이션 소프트웨어. 이미지 편집기, Morphing/Superimposition/<strong>VTO/STO 시뮬레이션</strong>, Level Anchorage 시뮬레이션 개발.",
      "tags": ["C++", "MFC", "DCMTK", "Simulation", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": [
          "VTO(Visual Treatment Objective) 시뮬레이션 알고리즘 개발",
          "STO(Surgical Treatment Objective) 시뮬레이션 개발",
          "이미지 Morphing 및 Superimposition 기능 구현"
        ],
        "certifications": ["CE", "FDA", "KFDA"]
      }
    },
    {
      "id": "orthovision",
      "company": "바텍 VATECH",
      "title": "OrthoVision Project",
      "period": "2007.01 - 2008.01",
      "roles": ["core-dev", "qa-doc"],
      "description": "교정 분석 소프트웨어. WPF 기반 교정 분석 차트, 사용자 차트 에디터, 프린터/스캐너 모듈 개발.",
      "tags": ["C#", "WPF", ".NET 3.0", "MSSQL", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": [
          "WPF 기반 차트 렌더링 엔진 개발",
          "사용자 정의 차트 에디터 설계",
          "프린터/스캐너 드라이버 통합"
        ],
        "certifications": ["CE", "FDA", "KFDA"]
      }
    }
  ],
  "equipmentControl": [
    {
      "id": "3d-printer",
      "company": "주식회사 레이",
      "title": "3D Printer Software",
      "period": "2016.05 - 2017.07",
      "roles": ["core-dev", "qa-doc"],
      "description": "3D 프린터 제어 프로그램. C++11, Qt QML, MFC 기반 DCMTK 연동 개발.",
      "tags": ["C++11", "Qt QML", "MFC", "DCMTK", "OpenGL", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": [
          "Qt QML 기반 사용자 인터페이스 개발",
          "프린터 하드웨어 제어 프로토콜 구현",
          "DICOM 데이터에서 3D 프린팅 모델 변환"
        ],
        "certifications": ["CE", "KFDA"]
      }
    },
    {
      "id": "high-speed-download",
      "company": "주식회사 레이",
      "title": "High Speed File Download System",
      "period": "2018.07 - 2019.01",
      "roles": ["architect", "core-dev", "qa-doc"],
      "description": "고속 파일 다운로드 시스템. 마이크로서비스 아키텍처 및 스레드 풀 설계. ISO 13485 문서 작성.",
      "tags": ["C++14", "Boost", "C#", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": [
          "비동기 다운로드 아키텍처 설계",
          "스레드 풀 기반 병렬 처리 구현",
          "IEC 62304 기반 검증 문서 작성"
        ],
        "challenges": [
          "동기 전송 방식의 시간 손실을 비동기 파이프라인으로 해결하여 다중 파일 전송 속도 10배 향상",
          "대용량 의료 영상 파일의 네트워크 전송 최적화",
          "불안정한 네트워크 환경에서의 재시도 로직"
        ]
      }
    },
    {
      "id": "easydent",
      "company": "바텍 VATECH",
      "title": "EasyDent Project",
      "period": "2004.07 - 2005.10",
      "roles": ["core-dev", "qa-doc"],
      "description": "치과 X-Ray 취득 및 시각화 소프트웨어. 가상 키보드, 이미지 에디터, 썸네일 성능 최적화.",
      "tags": ["C++", "MFC", "Win32 API", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": [
          "가상 키보드 UI 개발",
          "이미지 에디터 기능 구현",
          "썸네일 렌더링 성능 최적화"
        ],
        "certifications": ["CE", "FDA", "KFDA"]
      }
    }
  ],
  "enterprise": [
    {
      "id": "prs-server",
      "company": "포자랩스 POZAlabs",
      "title": "PRS Server",
      "period": "2024.01 - 2025.02",
      "roles": ["architect", "lead", "core-dev"],
      "description": "오디오 렌더링 SaaS 플랫폼의 마이크로서비스 아키텍처 개발. RabbitMQ 기반 메시지 큐, REST API 설계.",
      "tags": ["C++17", "RabbitMQ", "PostgreSQL", "Redis", "REST API"],
      "expanded": {
        "roles": [
          "마이크로서비스 아키텍처 설계 및 구현",
          "CI/CD 파이프라인 구축 (Daily Release)",
          "분산 메시지 큐 시스템 설계"
        ],
        "achievements": [
          "Zero-downtime 배포 체계 구축",
          "서비스 확장성 10배 향상",
          "모니터링 및 알림 시스템 구축"
        ]
      }
    },
    {
      "id": "ars-system",
      "company": "포자랩스 POZAlabs",
      "title": "ARS System",
      "period": "2023.04 - 2024.01",
      "roles": ["architect", "lead", "core-dev"],
      "description": "오디오 렌더링 시스템. C++17과 <strong>Rust</strong> 기반 마이크로서비스 아키텍처, TCP/REST API 통신.",
      "tags": ["C++17", "Rust", "PostgreSQL", "TCP"],
      "expanded": {
        "roles": [
          "Rust 기반 고성능 오디오 처리 모듈 개발",
          "C++/Rust 상호 운용성 구현",
          "실시간 오디오 스트리밍 프로토콜 설계"
        ],
        "challenges": [
          "저지연 실시간 오디오 처리",
          "멀티 언어 마이크로서비스 통합"
        ]
      }
    },
    {
      "id": "eda-ai-server",
      "company": "Purplechips",
      "title": "EDA AI Server",
      "period": "2022.03 - 2022.10",
      "roles": ["architect", "lead", "core-dev"],
      "description": "반도체 EDA용 AI 서버. C++17, Python 기반 마이크로서비스. <strong>ISO 26262</strong> (자동차 기능 안전) 규격 적용.",
      "tags": ["C++17", "Python", "Docker", "ISO 26262"],
      "expanded": {
        "roles": [
          "AI 추론 서버 아키텍처 설계",
          "Docker 컨테이너 오케스트레이션",
          "ISO 26262 ASIL 등급 문서 작성"
        ],
        "achievements": [
          "자동차 기능 안전 표준 충족",
          "AI 추론 파이프라인 최적화"
        ]
      }
    }
  ],
  "openSource": [
    {
      "id": "messaging-system",
      "title": "messaging_system",
      "github": "https://github.com/kcenon/messaging_system",
      "stars": 30,
      "description": "Modern C++20 메시징 인프라. <strong>Pub/Sub, Request/Reply, Event Streaming</strong>, 메시지 파이프라인 패턴 지원.",
      "tags": ["C++20", "Pub/Sub", "Event Streaming", "Lock-free"],
      "expanded": {
        "features": [
          "Publisher/Subscriber 패턴 구현",
          "Request/Reply 동기 통신",
          "Event Streaming 비동기 처리",
          "Message Pipeline 체이닝"
        ]
      }
    },
    {
      "id": "thread-system",
      "title": "thread_system",
      "github": "https://github.com/kcenon/thread_system",
      "stars": 7,
      "description": "Modern C++20 멀티스레딩 프레임워크. <strong>1.16M jobs/sec</strong> 처리량, Lock-free 큐, Hazard Pointers, Adaptive Optimization.",
      "tags": ["C++20", "Lock-free", "Thread Pool", "Hazard Pointers"],
      "expanded": {
        "features": [
          "초당 116만 작업 처리",
          "Lock-free 알고리즘 기반 큐",
          "Hazard Pointer 메모리 관리",
          "워크로드 기반 적응형 최적화"
        ]
      }
    },
    {
      "id": "network-system",
      "title": "network_system",
      "github": "https://github.com/kcenon/network_system",
      "description": "Modern C++20 비동기 네트워크 라이브러리. <strong>TCP/UDP, HTTP/1.1, WebSocket, TLS 1.3</strong> 지원. ASIO 기반 Non-blocking I/O.",
      "tags": ["C++20", "ASIO", "WebSocket", "TLS 1.3"],
      "expanded": {
        "features": [
          "TCP/UDP 소켓 통신",
          "HTTP/1.1 클라이언트/서버",
          "WebSocket 양방향 통신",
          "TLS 1.3 보안 연결"
        ]
      }
    },
    {
      "id": "pacs-system",
      "title": "pacs_system",
      "github": "https://github.com/kcenon/pacs_system",
      "description": "Modern C++20 PACS. <strong>외부 DICOM 라이브러리 없이</strong> kcenon 생태계만으로 구축. 고성능 비동기 I/O, SIMD 가속.",
      "tags": ["C++20", "DICOM", "PACS", "SIMD"],
      "expanded": {
        "features": [
          "순수 C++20 DICOM 구현",
          "외부 라이브러리 의존성 제거",
          "SIMD 가속 영상 처리",
          "비동기 네트워크 I/O"
        ]
      }
    },
    {
      "id": "logger-system",
      "title": "logger_system",
      "github": "https://github.com/kcenon/logger_system",
      "description": "비동기 로깅 프레임워크. <strong>4.34M msg/sec</strong> 처리량. 구조화된 로깅, 다중 출력, 로그 레벨 지원.",
      "tags": ["C++20", "Async", "High-throughput"],
      "expanded": {
        "features": [
          "초당 434만 메시지 처리",
          "비동기 I/O 기반",
          "Zero-copy 최적화"
        ]
      }
    },
    {
      "id": "database-system",
      "title": "database_system",
      "github": "https://github.com/kcenon/database_system",
      "description": "경량 C++20 Core DAL 라이브러리. 타입 안전 쿼리, 커넥션 풀링, 트랜잭션 관리.",
      "tags": ["C++20", "DAL", "Type-safe"],
      "expanded": {
        "features": [
          "헤더 전용 경량 라이브러리",
          "타입 안전 쿼리 빌더",
          "자동 커넥션 풀 관리"
        ]
      }
    }
  ]
},

  career: {
  "timeline": [
    {
      "id": "pozalabs",
      "company": "Poza Labs",
      "period": "2023 - 2025",
      "role": "Software Architect",
      "description": "오디오 렌더링 SaaS 플랫폼의 아키텍처 설계 총괄. C++, Rust, Go, Python 서비스 오케스트레이션. Zero-downtime 배포가 가능한 CI/CD 파이프라인 구축으로 <strong>Daily Release</strong> 체계 확립.",
      "note": "<strong>경험 확장</strong>: 의료 도메인에서 쌓은 역량을 바탕으로 <strong>AI/ML 파이프라인</strong> 및 <strong>클라우드 네이티브 아키텍처</strong>(AWS, Docker, Kubernetes)를 실무에 적용. On-premise 중심의 의료 시스템 경험을 클라우드 환경으로 확장하여, 향후 <strong>클라우드 기반 의료 AI 시스템</strong> 설계에 기여할 수 있는 역량 확보.",
      "tags": ["Rust", "Go", "Microservices", "AWS", "AI/ML Pipeline"],
      "highlight": false
    },
    {
      "id": "purplechips",
      "company": "Purplechips (POSTECH)",
      "period": "2022.03 - 2022.10 (8개월)",
      "role": "Lead Programmer",
      "description": "<strong>POSTECH</strong>과 <strong>POSCO</strong>의 합작 벤처로 기획된 AI 기반 EDA 스타트업. 딥러닝 기반 반도체 설계 자동화 솔루션 개발 프로젝트에서 리드 프로그래머로 참여하여 AI 작업 서빙 시스템 아키텍처 설계.",
      "note": "<strong>경험 확장</strong>: 의료 도메인에서 <strong>반도체/AI 도메인</strong>으로 전환하여 딥러닝 기반 알고리즘과 대규모 데이터 처리 파이프라인 구축 경험 획득. 이 경험을 통해 AI/ML 기술을 의료 영상 분석에 적용할 수 있는 역량 확보.",
      "tags": ["Python", "Deep Learning", "EDA", "AI/ML", "System Architecture"],
      "highlight": false
    },
    {
      "id": "ray",
      "company": "Ray",
      "period": "2010 - 2022",
      "role": "Lead Software Engineer → Principal Engineer",
      "badge": "IPO",
      "description": "<strong>삼성전자 의료사업부 자회사</strong>에서 분사한 치과 의료영상 시스템 전문 기업에서 <strong>12년간</strong> 핵심 개발자로 근무. PACS 서버, DICOM 뷰어, 2D 교정 시뮬레이션, 모달리티 장비 제어 시스템을 직접 설계하고 개발.",
      "achievements": [
        "<strong>C++</strong>이 백그라운드에서 무거운 영상 처리를 담당하고, <strong>.NET</strong>이 시각화를 담당하는 마이크로서비스 구조로 전환",
        "실시간 압축/직렬화로 100Mbps 네트워크에서 이론값(12.5MB/s)을 초과하는 <strong>15 MB/s</strong> 실효 전송량 달성",
        "레이턴시 <strong>50→25ms</strong> (50% 감소)",
        "<strong>ISO 13485, IEC 62304</strong> 규격 문서 직접 작성",
        "<strong>CE, FDA, KFDA, CCC</strong> 전 글로벌 인증 프로세스 참여 및 획득"
      ],
      "tags": ["C++", "C#", "DICOM", "ISO 13485", "IEC 62304"],
      "highlight": true
    },
    {
      "id": "vatech",
      "company": "(주)바텍 VATECH",
      "period": "2004 - 2009",
      "role": "Software Engineer",
      "badge": "IPO",
      "description": "치과용 X-ray 및 CBCT 의료영상 장비 전문 기업에서 소프트웨어 개발자로 경력 시작. <strong>DICOM 뷰어, 모달리티 장비 제어 시스템</strong>을 직접 설계하고 개발하며 <strong>2D 교정 시뮬레이션</strong> 개발에 참여. <strong>CE, FDA, KFDA</strong> 글로벌 인증 획득에 기여. 첫 번째 <strong>IPO 경험</strong>으로 벤처기업의 성장 과정을 직접 체험.",
      "tags": ["C++", "DICOM", "X-ray", "CBCT", "CE/FDA/KFDA"],
      "highlight": false
    },
    {
      "id": "inje",
      "company": "Inje University",
      "period": "1997 - 2005",
      "role": "Bachelor of Science in Electronic Engineering",
      "highlight": false
    }
  ]
},

  testimonials: {
  "featured": {
    "quote": "Mr. Dongcheol is <strong>the most exemplary and outstanding tech leader</strong> I have ever worked with. I gained extensive knowledge, particularly in large-scale systems and on-premise environments. The toolkit he provided to the company was incredibly user-friendly, greatly benefiting many junior developers.",
    "author": "Hyunkyu Lee",
    "role": "Software Developer",
    "relation": "2024.08 · 같은 부서"
  },
  "testimonials": [
    {
      "id": 1,
      "date": "2022.02",
      "context": "부하직원",
      "text": "신동철팀장님께서는 의료 분야 소프트웨어 엔지니어로서 필요한 의료 도메인 지식을 넓고 깊게 알고 계십니다. <strong>리드 프로그래머로서 책임감</strong>을 가지고 프로그램을 개발하면서도, 아래 직급의 사람이 의견을 내도 타당할 경우 해당내용을 수용해주시며 <strong>다른 팀원들의 실력 향상을 위해 노력</strong>하십니다.",
      "labels": [
        { "text": "Medical Domain", "type": "domain" },
        { "text": "Leadership", "type": "leadership" },
        { "text": "Team Growth", "type": "mentoring" }
      ],
      "author": "박석준",
      "role": "(주)레이",
      "relation": "Ray 팀원"
    },
    {
      "id": 2,
      "date": "2025.03",
      "context": "같은 부서",
      "text": "A great senior software engineer with specialty in <strong>large system architecture designs based on microservices</strong>. He's open to learn new skills and capable to apply them to real-world projects. His extensive experience has helped me many times in finding solutions.",
      "labels": [
        { "text": "Microservices", "type": "technical" },
        { "text": "Mentoring", "type": "mentoring" }
      ],
      "author": "Hyunjin Song",
      "role": "S/W Engineer, C++ and Rust",
      "relation": "Poza Labs 동료"
    },
    {
      "id": 3,
      "date": "2022.05",
      "context": "팀은 다름",
      "text": "Ability to <strong>provide a big direction for co-workers to solve problems on their own</strong> is excellent. He has a lot of experience and deep knowledge in medical software, especially dentistry. He is always trying to learn new skills, and has no fear or reluctance to apply new skills.",
      "labels": [
        { "text": "Medical/Dental", "type": "domain" },
        { "text": "Direction", "type": "leadership" }
      ],
      "author": "Gyeong Uk Min",
      "role": "Dental Software",
      "relation": "Ray 협업 동료"
    },
    {
      "id": 4,
      "date": "2022.10",
      "context": "같은 부서",
      "text": "The most thoughtful C++ engineer I've ever worked with. I worked with him to integrate the AI modules written in Python into the C++ program. <strong>Writing comprehensible code and building programs to make it easier to maintain</strong> are the most distinctive of his many specialties.",
      "labels": [
        { "text": "C++ Expert", "type": "technical" },
        { "text": "Code Quality", "type": "technical" }
      ],
      "author": "junyaup Kim",
      "role": "Watsonx Customer Success Manager",
      "relation": "Ray 동료"
    },
    {
      "id": 5,
      "date": "2014.05",
      "context": "클라이언트",
      "text": "One of the best engineers I have seen. Writing up a <strong>Database Service from scratch in a short term</strong> is quite an accomplishment and Mr Shin did it with ease. He has pushed himself all the time to perform better and has continuously achieved better results during his tenure with us at Samsung.",
      "labels": [
        { "text": "Fast Delivery", "type": "technical" },
        { "text": "Self-improvement", "type": "leadership" }
      ],
      "author": "Nasir Ahmed Desai",
      "role": "Informatics Software Leader, DeepHealth",
      "relation": "Samsung 클라이언트"
    },
    {
      "id": 6,
      "date": "2013.10",
      "context": "같은 부서",
      "text": "A very talented person with deep technical knowledge. He joined DICOM Platform team and took over a challenging component right away. He went ahead and <strong>optimized the performance spec by 2x</strong>. His communication skills are well appreciated.",
      "labels": [
        { "text": "Performance 2x", "type": "technical" },
        { "text": "Communication", "type": "communication" }
      ],
      "author": "Rakesh Dutta",
      "role": "Director, R&D at Stryker Robotics",
      "relation": "Samsung 동료"
    },
    {
      "id": 7,
      "date": "2022.05",
      "context": "직속상사",
      "text": "He always tries to learn about new technologies and apply them to his work. The project to develop new <strong>dental imaging server and application based on microservices</strong> was successful in performance, scalability and maintainability. I'm sure he would be a good teammate on any development team.",
      "labels": [
        { "text": "Microservices", "type": "technical" },
        { "text": "Continuous Learning", "type": "mentoring" }
      ],
      "author": "Chulhyun(Charles) Lee",
      "role": "Senior Technical Product Manager",
      "relation": "Ray 직속상사"
    },
    {
      "id": 8,
      "date": "2022.10",
      "context": "팀은 다름",
      "text": "Excellent capabilities in the field of <strong>large-capacity transmission or real-time processing</strong>. He also likes to acquire new skills and reflect them in projects. He never neglects his efforts to improve his code. I got a lot of inspiration collaborating with him on medical image transmission.",
      "labels": [
        { "text": "Real-time", "type": "technical" },
        { "text": "High-throughput", "type": "technical" }
      ],
      "author": "DongKeun Kang",
      "role": "David, Kang",
      "relation": "Ray 협업 동료"
    },
    {
      "id": 9,
      "date": "2021.02",
      "context": "직장선배",
      "text": "A lot of experiences in medical imaging field and a very well trained programmer. Most of all, <strong>he is eager for knowledge</strong>. So he can be very good in adopting new technologies. I recommend him in general application programming and medical imaging field.",
      "labels": [
        { "text": "Medical Imaging", "type": "domain" },
        { "text": "Eager to Learn", "type": "mentoring" }
      ],
      "author": "이우석",
      "role": "Lunit Software Developer",
      "relation": "VATECH 직장선배"
    }
  ]
},

  expertise: {
  "categories": [
    {
      "id": "medical",
      "icon": "hospital",
      "title": "Medical Systems",
      "items": [
        "PACS (Picture Archiving & Communication System)",
        "DICOM Standard Implementation",
        "3D Volume Rendering & MPR",
        "Modality Equipment Control",
        "HIS/RIS Integration (HL7, FHIR)",
        "Orthodontic Simulation"
      ]
    },
    {
      "id": "regulatory",
      "icon": "clipboard",
      "title": "Regulatory & Compliance",
      "items": [
        "ISO 13485 (Medical Device QMS)",
        "IEC 62304 (생명주기 모델 기반 개발)",
        "FDA 510(k) / KFDA (한국 식약처)",
        "CE Marking (유럽) / CCC (중국)",
        "<strong>HIPAA Compliance</strong> (PHI 보안, 감사 로깅)",
        "Software Risk Management (ISO 14971)",
        "Design Control Documentation"
      ]
    },
    {
      "id": "performance",
      "icon": "zap",
      "title": "High Performance Systems",
      "items": [
        "Lock-free Data Structures",
        "SIMD Optimization",
        "Async I/O & Event-driven Architecture",
        "Memory-efficient Design",
        "Sub-microsecond Latency Systems",
        "Distributed System Architecture"
      ]
    },
    {
      "id": "technologies",
      "icon": "tool",
      "title": "Technologies",
      "tags": [
        "C++20", "C#/.NET", "Rust", "Python", "Go", "TypeScript",
        "Qt", "WPF/MVVM", "OpenGL", "OpenCV", "PostgreSQL", "Redis", "Docker", "AWS"
      ]
    }
  ],
  "certifications": [
    { "icon": "EU", "name": "CE" },
    { "icon": "US", "name": "FDA" },
    { "icon": "KR", "name": "KFDA" },
    { "icon": "CN", "name": "CCC" },
    { "icon": "US", "name": "HIPAA" }
  ],
  "heroCapabilities": [
    { "icon": "check-circle", "title": "Full Lifecycle", "description": "IEC 62304 기반 전 개발 단계 수행" },
    { "icon": "file-text", "title": "Regulatory Docs", "description": "ISO 13485, IEC 62304 규격 문서 작성" },
    { "icon": "users", "title": "Team Leadership", "description": "코드 리뷰와 멘토링 기반 팀 성장" },
    { "icon": "check-square", "title": "Clinical Validation", "description": "임상 시험 및 검증 단계 완수" }
  ],
  "lifecycleDetails": [
    { "icon": "clipboard", "title": "문서화", "description": "SRS, SDS, 위험분석, 추적성 매트릭스 등 IEC 62304 필수 문서 작성" },
    { "icon": "search", "title": "검증 & 확인", "description": "각 단계별 검증 활동 및 독립적인 유효성 확인 수행" },
    { "icon": "alert-triangle", "title": "위험 관리", "description": "ISO 14971 기반 소프트웨어 위험 분석 및 완화 조치" },
    { "icon": "refresh-cw", "title": "변경 관리", "description": "체계적인 변경 통제 및 영향 분석 프로세스" },
    { "icon": "users", "title": "SQA 협업", "description": "SQA 팀과 긴밀히 협업하여 품질 보증 프로세스 수립 및 준수" },
    { "icon": "flask", "title": "테스트 자동화", "description": "단위 테스트 기반 자동화 검증 강화로 회귀 오류 방지 및 품질 향상" }
  ]
}
};
