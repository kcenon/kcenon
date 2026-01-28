/**
 * Portfolio Data - Inline JavaScript Data with i18n Support
 * This file contains all portfolio data to work without a server (file:// protocol)
 */

window.PortfolioData = {
  projects: {
  "featured": [
    {
      "id": "smartdent-v3",
      "icon": "hospital",
      "company": { "ko": "주식회사 레이", "en": "Ray Co., Ltd." },
      "title": "SMARTDent v3",
      "period": "2019.01 - 2020.06",
      "roles": ["architect", "lead", "qa-doc"],
      "description": {
        "ko": "치과 CT/X-Ray 장비를 위한 통합 의료 영상 플랫폼. <strong>마이크로서비스 아키텍처</strong> 설계, 영상 취득 소프트웨어, DICOM 2D/3D 시각화 소프트웨어를 개발. <strong>ISO 13485</strong> 인증을 위한 검증 문서 직접 작성.",
        "en": "Integrated medical imaging platform for dental CT/X-Ray equipment. Designed <strong>microservices architecture</strong>, developed image acquisition software, DICOM 2D/3D visualization software. Authored verification documents for <strong>ISO 13485</strong> certification."
      },
      "metrics": [
        {
          "value": "15 MB/s",
          "label": { "ko": "압축 기준 raw-equivalent 전송량 @100Mbps", "en": "Raw-equivalent throughput (with compression) @100Mbps" },
          "change": { "ko": "12.5 MB/s(이론치) 대비", "en": "vs 12.5 MB/s theoretical" },
          "positive": true
        },
        {
          "value": "25 ms",
          "label": { "ko": "엔드-투-엔드 레이턴시", "en": "End-to-end latency" },
          "change": "-50%",
          "positive": true
        }
      ],
      "tags": ["C++14", "C#", "WPF", "DICOM", "PostgreSQL", "ISO 13485", "IEC 62304", "DCMTK", "PACS"],
      "expanded": {
        "roles": {
          "ko": [
            "C++ 백엔드와 .NET 프론트엔드 분리 마이크로서비스 아키텍처 설계",
            "팀 6명 리딩, 18개월 내 4개국 인증(CE/FDA/KFDA/CCC) 동시 획득 주도",
            "Database Gateway 설계로 데이터 암호화 및 시스템 간 자동 동기화 구현"
          ],
          "en": [
            "Designed microservices architecture separating C++ backend and .NET frontend",
            "Led team of 6, achieved 4 country certifications (CE/FDA/KFDA/CCC) within 18 months",
            "Implemented Database Gateway for data encryption and automatic system synchronization"
          ]
        },
        "challenges": {
          "ko": [
            "대용량 의료 영상 실시간 처리 (CT 볼륨 데이터 1GB+)",
            "레거시 모놀리식 시스템의 마이크로서비스 전환",
            "다양한 모달리티 장비와의 DICOM 호환성 확보"
          ],
          "en": [
            "Real-time processing of large medical images (CT volume data 1GB+)",
            "Migration from legacy monolithic system to microservices",
            "Ensuring DICOM compatibility with various modality equipment"
          ]
        },
        "solutions": {
          "ko": [
            "비동기 I/O 및 멀티스레드 파이프라인으로 처리량 2배 향상",
            "PostgreSQL 분산 데이터 저장소 설계 및 Database Gateway 구축",
            "Database Gateway를 통한 데이터 암호화/복호화 및 네트워크 전체 시스템 자동 상태 동기화",
            "DCMTK 라이브러리 커스터마이징으로 호환성 문제 해결"
          ],
          "en": [
            "Achieved 2x throughput improvement with async I/O and multi-threaded pipeline",
            "Designed PostgreSQL distributed data store and built Database Gateway",
            "Implemented data encryption/decryption and automatic system state sync via Database Gateway",
            "Resolved compatibility issues by customizing DCMTK library"
          ]
        },
        "certifications": ["CE", "FDA 510(k)", "KFDA", "CCC"]
      }
    },
    {
      "id": "samsung-ct",
      "icon": "microscope",
      "company": { "ko": "주식회사 레이 → Samsung", "en": "Ray Co., Ltd. → Samsung" },
      "title": "Medical CT Project for Samsung",
      "period": "2012.11 - 2014.01",
      "roles": ["architect", "core-dev"],
      "description": {
        "ko": "삼성전자 CT/MR 제품을 위한 <strong>DICOM 소프트웨어 플랫폼</strong> 개발. 데이터베이스 서버와 PACS 네트워크 서버(C-STORE/C-FIND/C-MOVE)의 클래스 계층 구조를 설계하고, 처리량 <strong>2배 향상</strong> 달성.",
        "en": "Developed <strong>DICOM software platform</strong> for Samsung CT/MR products. Designed class hierarchy for database server and PACS network server (C-STORE/C-FIND/C-MOVE), achieving <strong>2x throughput improvement</strong>."
      },
      "metrics": [
        {
          "value": "2x",
          "label": { "ko": "PACS 처리량 향상", "en": "PACS throughput improvement" },
          "positive": true
        }
      ],
      "tags": ["C++11", "Boost", "PostgreSQL", "DCMTK", "PACS", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": {
          "ko": [
            "DICOM 플랫폼 아키텍처 설계",
            "데이터베이스 스키마 및 쿼리 최적화",
            "PACS 네트워크 서버 핵심 모듈 개발"
          ],
          "en": [
            "Designed DICOM platform architecture",
            "Optimized database schema and queries",
            "Developed core PACS network server modules"
          ]
        },
        "challenges": {
          "ko": [
            "대용량 CT/MR 영상 데이터의 고속 저장 및 검색",
            "기존 PACS 시스템 대비 성능 2배 향상 요구사항",
            "다양한 DICOM Conformance 요구사항 충족"
          ],
          "en": [
            "High-speed storage and retrieval of large CT/MR image data",
            "Requirement for 2x performance improvement over existing PACS system",
            "Meeting various DICOM Conformance requirements"
          ]
        },
        "solutions": {
          "ko": [
            "PL/SQL 기반 최적화된 저장 프로시저 설계",
            "C++ Boost 라이브러리 활용한 고성능 네트워크 처리",
            "계층적 클래스 구조로 확장성 있는 DICOM 서비스 구현"
          ],
          "en": [
            "Designed optimized stored procedures based on PL/SQL",
            "High-performance network processing using C++ Boost library",
            "Implemented scalable DICOM services with hierarchical class structure"
          ]
        },
        "achievements": {
          "ko": [
            "삼성전자 CT/MR 제품군에 탑재",
            "글로벌 시장 출시 성공"
          ],
          "en": [
            "Deployed in Samsung CT/MR product line",
            "Successfully launched in global market"
          ]
        }
      }
    },
    {
      "id": "prs-server",
      "icon": "tool",
      "company": { "ko": "포자랩스 POZAlabs", "en": "POZAlabs" },
      "title": "PRS Server",
      "period": "2024.01 - 2025.02",
      "roles": ["architect", "lead", "core-dev"],
      "description": {
        "ko": "오디오 렌더링 SaaS 플랫폼의 <strong>분산 시스템</strong> 및 마이크로서비스 아키텍처 개발. RabbitMQ 기반 메시지 큐, REST API, CI/CD(Daily Release) 설계·구축.",
        "en": "Built <strong>distributed system</strong> and microservices architecture for an audio rendering SaaS platform. Designed RabbitMQ-based messaging, REST APIs, and CI/CD (Daily Release)."
      },
      "metrics": [
        {
          "value": "10+",
          "label": { "ko": "마이크로서비스", "en": "Microservices" },
          "positive": true
        },
        {
          "value": "Daily",
          "label": { "ko": "릴리즈 사이클", "en": "Release cadence" },
          "positive": true
        }
      ],
      "tags": ["C++17", "RabbitMQ", "PostgreSQL", "Redis", "REST API", "CI/CD", "Observability"],
      "expanded": {
        "roles": {
          "ko": [
            "마이크로서비스 아키텍처 설계 및 구현",
            "CI/CD 파이프라인 구축 (Daily Release)",
            "분산 메시지 큐 시스템 설계"
          ],
          "en": [
            "Designed and implemented microservices architecture",
            "Built CI/CD pipeline (Daily Release)",
            "Designed distributed message queue system"
          ]
        },
        "challenges": {
          "ko": [
            "저지연 대량 작업(Job) 처리와 안정적인 큐잉",
            "다수 서비스 간 의존성/버전 관리",
            "무중단 배포와 빠른 릴리즈 사이클 유지"
          ],
          "en": [
            "Low-latency high-throughput job processing with reliable queuing",
            "Dependency/version management across many services",
            "Maintaining zero-downtime deployments with fast release cadence"
          ]
        },
        "solutions": {
          "ko": [
            "RabbitMQ 라우팅/재시도/Dead-letter 기반 메시지 흐름 설계",
            "관측성(Tracing/metrics/logging) 기반 병목 분석과 운영 안정화",
            "자동화된 CI/CD로 배포 표준화 및 롤백 가능한 릴리즈 프로세스 구축"
          ],
          "en": [
            "Designed message flows with RabbitMQ routing/retry/dead-letter patterns",
            "Stabilized operations with observability (tracing/metrics/logging) and bottleneck analysis",
            "Standardized deploys and rollback-safe releases via automated CI/CD"
          ]
        },
        "achievements": {
          "ko": [
            "Zero-downtime 배포 체계 구축",
            "서비스 확장성 10배 향상",
            "모니터링 및 알림 시스템 구축"
          ],
          "en": [
            "Established zero-downtime deployment system",
            "Achieved 10x service scalability improvement",
            "Built monitoring and alerting system"
          ]
        }
      }
    }
  ],
  "medicalImaging": [
    {
      "id": "alpha-project",
      "company": { "ko": "주식회사 레이", "en": "Ray Co., Ltd." },
      "title": "Alpha Project",
      "period": "2011.01 - 2012.10",
      "roles": ["architect", "lead", "core-dev"],
      "description": {
        "ko": "치과 CT/X-Ray 취득 및 DICOM 2D/3D 시각화 소프트웨어. <strong>DirectX Shader(HLSL)</strong> 기반 이미지 처리 모듈 개발.",
        "en": "Dental CT/X-Ray acquisition and DICOM 2D/3D visualization software. Developed image processing modules based on <strong>DirectX Shader (HLSL)</strong>."
      },
      "tags": ["C#", "WPF", "DirectX", "PostgreSQL", "ClearCanvas", "PACS", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": {
          "ko": [
            "DirectX HLSL 기반 GPU 가속 이미지 처리 파이프라인 설계",
            "ClearCanvas 오픈소스 커스터마이징으로 PACS 연동 구현",
            "팀 4명 리딩, 22개월 개발 기간 내 CE/FDA/KFDA 인증 획득"
          ],
          "en": [
            "Designed GPU-accelerated image processing pipeline based on DirectX HLSL",
            "Implemented PACS integration by customizing ClearCanvas open source",
            "Led team of 4, achieved CE/FDA/KFDA certifications within 22 months"
          ]
        },
        "certifications": ["CE", "FDA", "KFDA"]
      }
    },
    {
      "id": "dicom-visualization",
      "company": { "ko": "주식회사 레이", "en": "Ray Co., Ltd." },
      "title": "Visualization Software for DICOM",
      "period": "2010.02 - 2010.12",
      "roles": ["architect", "core-dev", "qa-doc"],
      "description": {
        "ko": "DICOM 2D/3D 시각화 소프트웨어. WPF 기반 프레임워크 및 이미지 처리 모듈 개발. 의료기기 검증 문서 작성.",
        "en": "DICOM 2D/3D visualization software. Developed WPF-based framework and image processing modules. Authored medical device verification documents."
      },
      "tags": ["C++11", "C#", "MFC", "MSSQL", "ClearCanvas", "PACS", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": {
          "ko": [
            "WPF MVVM 기반 플러그인 구조 뷰어 프레임워크 설계",
            "Window/Level, Pan/Zoom 등 DICOM 영상 처리 알고리즘 직접 구현",
            "MFC 레거시 모듈을 C# 래퍼로 통합하여 기존 자산 재활용",
            "IEC 62304 SRS/SDS 문서 작성 및 검증 테스트 수행"
          ],
          "en": [
            "Designed plugin-based viewer framework using WPF MVVM",
            "Directly implemented DICOM image processing algorithms (Window/Level, Pan/Zoom)",
            "Integrated MFC legacy modules via C# wrapper for asset reuse",
            "Authored IEC 62304 SRS/SDS documents and performed verification tests"
          ]
        },
        "certifications": ["CE", "FDA", "KFDA"]
      }
    },
    {
      "id": "3d-visualization",
      "company": { "ko": "주식회사 레이", "en": "Ray Co., Ltd." },
      "title": "3D Visualization Software",
      "period": "2014.01 - 2015.06",
      "roles": ["core-dev"],
      "description": {
        "ko": "DICOM 3D 뷰어 개발. C#, WPF 기반 3D 엔진 활용.",
        "en": "Developed DICOM 3D viewer. Utilized 3D engine based on C# and WPF."
      },
      "tags": ["C#", "WPF", "Fovia", "ClearCanvas", "PACS", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": {
          "ko": [
            "3D 볼륨 렌더링 엔진 통합",
            "MPR(Multi-Planar Reconstruction) 뷰어 개발",
            "3D 측정 도구 구현"
          ],
          "en": [
            "Integrated 3D volume rendering engine",
            "Developed MPR (Multi-Planar Reconstruction) viewer",
            "Implemented 3D measurement tools"
          ]
        },
        "certifications": ["CE", "FDA", "KFDA", "CCC"]
      }
    },
    {
      "id": "high-speed-download",
      "company": { "ko": "주식회사 레이", "en": "Ray Co., Ltd." },
      "title": "High Speed File Download System",
      "period": "2018.07 - 2019.01",
      "roles": ["architect", "core-dev", "qa-doc"],
      "description": {
        "ko": "고속 파일 다운로드 시스템. 마이크로서비스 아키텍처 및 스레드 풀 설계. ISO 13485 문서 작성.",
        "en": "High-speed file download system. Designed microservices architecture and thread pool. Authored ISO 13485 documents."
      },
      "tags": ["C++14", "Boost", "C#", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": {
          "ko": [
            "비동기 다운로드 아키텍처 설계",
            "스레드 풀 기반 병렬 처리 구현",
            "IEC 62304 기반 검증 문서 작성"
          ],
          "en": [
            "Designed asynchronous download architecture",
            "Implemented parallel processing based on thread pool",
            "Authored IEC 62304 verification documents"
          ]
        },
        "challenges": {
          "ko": [
            "동기 전송 방식의 시간 손실을 비동기 파이프라인으로 해결하여 다중 파일 전송 속도 10배 향상",
            "대용량 의료 영상 파일의 네트워크 전송 최적화",
            "불안정한 네트워크 환경에서의 재시도 로직"
          ],
          "en": [
            "Achieved 10x multi-file transfer speed by replacing synchronous with async pipeline",
            "Optimized network transfer of large medical image files",
            "Retry logic for unstable network environments"
          ]
        }
      }
    },
    {
      "id": "sherpa",
      "company": { "ko": "(주)바텍이우홀딩스", "en": "VATECH E-WOO Holdings" },
      "title": "Sherpa Project",
      "period": "2008.01 - 2009.07",
      "roles": ["core-dev", "qa-doc"],
      "description": {
        "ko": "치과 CT/X-Ray 취득 및 치과 영상 시각화 소프트웨어. 차트 관리자, 카메라/프린터/스캐너 모듈, TCP/IP 통신 개발.",
        "en": "Dental CT/X-Ray acquisition and dental image visualization software. Developed chart manager, camera/printer/scanner modules, and TCP/IP communication."
      },
      "tags": ["C#", "WPF", "DirectShow", "LINQ", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": {
          "ko": [
            "전체 소프트웨어 아키텍처 설계",
            "DirectShow 기반 카메라 모듈 개발",
            "TCP/IP 기반 장비 통신 프로토콜 설계"
          ],
          "en": [
            "Designed overall software architecture",
            "Developed camera module based on DirectShow",
            "Designed TCP/IP-based equipment communication protocol"
          ]
        },
        "certifications": ["CE", "FDA", "KFDA"]
      }
    }
  ],
  "orthodontic": [
    {
      "id": "ezceph",
      "company": { "ko": "바텍 VATECH", "en": "VATECH" },
      "title": "EzCeph Project",
      "period": "2004.07 - 2005.12",
      "roles": ["core-dev", "qa-doc"],
      "description": {
        "ko": "교정 시뮬레이션 소프트웨어. 이미지 편집기, Morphing/Superimposition/<strong>VTO/STO 시뮬레이션</strong>, Level Anchorage 시뮬레이션 개발.",
        "en": "Orthodontic simulation software. Developed image editor, Morphing/Superimposition/<strong>VTO/STO simulation</strong>, and Level Anchorage simulation."
      },
      "tags": ["C++", "MFC", "DCMTK", "Simulation", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": {
          "ko": [
            "VTO(Visual Treatment Objective) 시뮬레이션 알고리즘 개발",
            "STO(Surgical Treatment Objective) 시뮬레이션 개발",
            "이미지 Morphing 및 Superimposition 기능 구현"
          ],
          "en": [
            "Developed VTO (Visual Treatment Objective) simulation algorithms",
            "Developed STO (Surgical Treatment Objective) simulation",
            "Implemented image Morphing and Superimposition features"
          ]
        },
        "certifications": ["CE", "FDA", "KFDA"]
      }
    },
    {
      "id": "orthovision",
      "company": { "ko": "바텍 VATECH", "en": "VATECH" },
      "title": "OrthoVision Project",
      "period": "2007.01 - 2008.01",
      "roles": ["core-dev", "qa-doc"],
      "description": {
        "ko": "교정 분석 소프트웨어. WPF 기반 교정 분석 차트, 사용자 차트 에디터, 프린터/스캐너 모듈 개발.",
        "en": "Orthodontic analysis software. Developed WPF-based orthodontic analysis charts, custom chart editor, and printer/scanner modules."
      },
      "tags": ["C#", "WPF", ".NET 3.0", "MSSQL", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": {
          "ko": [
            "WPF 기반 차트 렌더링 엔진 개발",
            "사용자 정의 차트 에디터 설계",
            "프린터/스캐너 드라이버 통합"
          ],
          "en": [
            "Developed WPF-based chart rendering engine",
            "Designed custom chart editor",
            "Integrated printer/scanner drivers"
          ]
        },
        "certifications": ["CE", "FDA", "KFDA"]
      }
    }
  ],
  "equipmentControl": [
    {
      "id": "3d-printer",
      "company": { "ko": "주식회사 레이", "en": "Ray Co., Ltd." },
      "title": "3D Printer Software",
      "period": "2016.05 - 2017.07",
      "roles": ["core-dev", "qa-doc"],
      "description": {
        "ko": "3D 프린터 제어 프로그램. C++11, Qt QML, MFC 기반 DCMTK 연동 개발.",
        "en": "3D printer control software. Developed with C++11, Qt QML, MFC-based DCMTK integration."
      },
      "tags": ["C++11", "Qt QML", "MFC", "DCMTK", "OpenGL", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": {
          "ko": [
            "Qt QML 기반 사용자 인터페이스 개발",
            "프린터 하드웨어 제어 프로토콜 구현",
            "DICOM 데이터에서 3D 프린팅 모델 변환"
          ],
          "en": [
            "Developed user interface based on Qt QML",
            "Implemented printer hardware control protocol",
            "Converted DICOM data to 3D printing models"
          ]
        },
        "certifications": ["CE", "KFDA"]
      }
    },
    {
      "id": "automation-alignment",
      "company": { "ko": "주식회사 레이", "en": "Ray Co., Ltd." },
      "title": "Automation Alignment Software",
      "period": "2015.07 - 2016.04",
      "roles": ["architect", "core-dev", "qa-doc"],
      "description": {
        "ko": "의료기기 자동 정렬 소프트웨어. <strong>DirectX Shader(HLSL)</strong> 기반 영상 처리. ISO 13485 검증 문서 작성.",
        "en": "Medical device automatic alignment software. Image processing based on <strong>DirectX Shader (HLSL)</strong>. Authored ISO 13485 verification documents."
      },
      "tags": ["C#", "WPF", "DirectX", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": {
          "ko": [
            "영상 정합 알고리즘 설계",
            "GPU 기반 실시간 처리 구현",
            "IEC 62304 검증 문서 작성"
          ],
          "en": [
            "Designed image registration algorithms",
            "Implemented GPU-based real-time processing",
            "Authored IEC 62304 verification documents"
          ]
        },
        "certifications": ["CE", "FDA", "KFDA"]
      }
    },
    {
      "id": "intraoral-sensor-sdk",
      "company": { "ko": "주식회사 레이", "en": "Ray Co., Ltd." },
      "title": "Intraoral Sensor SDK",
      "period": "2015.01 - 2015.06",
      "roles": ["architect", "core-dev"],
      "description": {
        "ko": "구강 내 센서용 SDK 및 TWAIN 드라이버 개발. C++, Boost 기반 SDK와 C#, WPF 기반 이미징 뷰어.",
        "en": "Developed SDK and TWAIN driver for intraoral sensors. C++/Boost-based SDK and C#/WPF-based imaging viewer."
      },
      "tags": ["C++14", "C#", "SDK", "TWAIN", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": {
          "ko": [
            "센서 하드웨어 인터페이스 SDK 설계",
            "TWAIN 호환 드라이버 개발",
            "3rd party 연동 API 문서 작성"
          ],
          "en": [
            "Designed sensor hardware interface SDK",
            "Developed TWAIN-compatible driver",
            "Authored 3rd party integration API documentation"
          ]
        },
        "certifications": ["CE", "FDA", "KFDA"]
      }
    },
    {
      "id": "implagraphy",
      "company": { "ko": "바텍 VATECH", "en": "VATECH" },
      "title": "Implagraphy Project",
      "period": "2005.08 - 2005.11",
      "roles": ["core-dev", "qa-doc"],
      "description": {
        "ko": "치과 CT/X-Ray 취득 소프트웨어. 이미지 처리 모듈, DICOM 데이터 핸들링, 의료기기 검증 문서 작성.",
        "en": "Dental CT/X-Ray acquisition software. Developed image processing modules, DICOM data handling, and medical device verification documents."
      },
      "tags": ["C++", "MFC", "RS232", "DICOM", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": {
          "ko": [
            "이미지 처리 알고리즘 개발",
            "RS232 시리얼 통신 구현",
            "DICOM 데이터 핸들러 개발"
          ],
          "en": [
            "Developed image processing algorithms",
            "Implemented RS232 serial communication",
            "Developed DICOM data handler"
          ]
        },
        "certifications": ["CE", "FDA", "KFDA"]
      }
    },
    {
      "id": "easydent",
      "company": { "ko": "바텍 VATECH", "en": "VATECH" },
      "title": "EasyDent Project",
      "period": "2004.07 - 2005.10",
      "roles": ["core-dev", "qa-doc"],
      "description": {
        "ko": "치과 X-Ray 취득 및 시각화 소프트웨어. 가상 키보드, 이미지 에디터, 썸네일 성능 최적화.",
        "en": "Dental X-Ray acquisition and visualization software. Developed virtual keyboard, image editor, and optimized thumbnail performance."
      },
      "tags": ["C++", "MFC", "Win32 API", "ISO 13485", "IEC 62304"],
      "expanded": {
        "roles": {
          "ko": [
            "가상 키보드 UI 개발",
            "이미지 에디터 기능 구현",
            "썸네일 렌더링 성능 최적화"
          ],
          "en": [
            "Developed virtual keyboard UI",
            "Implemented image editor features",
            "Optimized thumbnail rendering performance"
          ]
        },
        "certifications": ["CE", "FDA", "KFDA"]
      }
    }
  ],
  "enterprise": [
    {
      "id": "ars-system",
      "company": { "ko": "포자랩스 POZAlabs", "en": "POZAlabs" },
      "title": "ARS System",
      "period": "2023.04 - 2024.01",
      "roles": ["architect", "lead", "core-dev"],
      "description": {
        "ko": "오디오 렌더링 시스템. C++17과 <strong>Rust</strong> 기반 마이크로서비스 아키텍처, TCP/REST API 통신.",
        "en": "Audio rendering system. Microservices architecture based on C++17 and <strong>Rust</strong>, TCP/REST API communication."
      },
      "tags": ["C++17", "Rust", "PostgreSQL", "TCP"],
      "expanded": {
        "roles": {
          "ko": [
            "Rust 기반 고성능 오디오 처리 모듈 개발",
            "C++/Rust 상호 운용성 구현",
            "실시간 오디오 스트리밍 프로토콜 설계"
          ],
          "en": [
            "Developed high-performance audio processing module in Rust",
            "Implemented C++/Rust interoperability",
            "Designed real-time audio streaming protocol"
          ]
        },
        "challenges": {
          "ko": [
            "저지연 실시간 오디오 처리",
            "멀티 언어 마이크로서비스 통합"
          ],
          "en": [
            "Low-latency real-time audio processing",
            "Multi-language microservices integration"
          ]
        }
      }
    },
    {
      "id": "eda-ai-server",
      "company": { "ko": "Purplechips", "en": "Purplechips" },
      "title": "EDA AI Server",
      "period": "2022.03 - 2022.10",
      "roles": ["architect", "lead", "core-dev"],
      "description": {
        "ko": "반도체 EDA용 AI 서버. C++17, Python 기반 마이크로서비스. <strong>ISO 26262</strong> (자동차 기능 안전) 규격 적용.",
        "en": "AI server for semiconductor EDA. Microservices based on C++17 and Python. Applied <strong>ISO 26262</strong> (automotive functional safety) standard."
      },
      "tags": ["C++17", "Python", "Docker", "ISO 26262"],
      "expanded": {
        "roles": {
          "ko": [
            "AI 추론 서버 아키텍처 설계",
            "Docker 컨테이너 오케스트레이션",
            "ISO 26262 ASIL 등급 문서 작성"
          ],
          "en": [
            "Designed AI inference server architecture",
            "Docker container orchestration",
            "Authored ISO 26262 ASIL grade documentation"
          ]
        },
        "achievements": {
          "ko": [
            "자동차 기능 안전 표준 충족",
            "AI 추론 파이프라인 최적화"
          ],
          "en": [
            "Met automotive functional safety standards",
            "Optimized AI inference pipeline"
          ]
        }
      }
    }
  ],
  "openSource": [
    {
      "id": "messaging-system",
      "title": "messaging_system",
      "github": "https://github.com/kcenon/messaging_system",
      "stars": 30,
      "description": {
        "ko": "Modern C++20 메시징 인프라. <strong>Pub/Sub, Request/Reply, Event Streaming</strong>, 메시지 파이프라인 패턴 지원.",
        "en": "Modern C++20 messaging infrastructure. Supports <strong>Pub/Sub, Request/Reply, Event Streaming</strong>, and message pipeline patterns."
      },
      "tags": ["C++20", "Pub/Sub", "Event Streaming", "Lock-free"],
      "expanded": {
        "features": {
          "ko": [
            "Publisher/Subscriber 패턴 구현",
            "Request/Reply 동기 통신",
            "Event Streaming 비동기 처리",
            "Message Pipeline 체이닝"
          ],
          "en": [
            "Publisher/Subscriber pattern implementation",
            "Request/Reply synchronous communication",
            "Event Streaming asynchronous processing",
            "Message Pipeline chaining"
          ]
        }
      }
    },
    {
      "id": "thread-system",
      "title": "thread_system",
      "github": "https://github.com/kcenon/thread_system",
      "stars": 7,
      "description": {
        "ko": "Modern C++20 멀티스레딩 프레임워크. <strong>1.16M jobs/sec</strong> 처리량, Lock-free 큐, Hazard Pointers, Adaptive Optimization.",
        "en": "Modern C++20 multithreading framework. <strong>1.16M jobs/sec</strong> throughput, Lock-free queue, Hazard Pointers, Adaptive Optimization."
      },
      "tags": ["C++20", "Lock-free", "Thread Pool", "Hazard Pointers"],
      "expanded": {
        "features": {
          "ko": [
            "초당 116만 작업 처리",
            "Lock-free 알고리즘 기반 큐",
            "Hazard Pointer 메모리 관리",
            "워크로드 기반 적응형 최적화"
          ],
          "en": [
            "1.16 million jobs per second processing",
            "Lock-free algorithm based queue",
            "Hazard Pointer memory management",
            "Workload-based adaptive optimization"
          ]
        }
      }
    },
    {
      "id": "network-system",
      "title": "network_system",
      "github": "https://github.com/kcenon/network_system",
      "description": {
        "ko": "Modern C++20 비동기 네트워크 라이브러리. <strong>TCP/UDP, HTTP/1.1, WebSocket, TLS 1.3</strong> 지원. ASIO 기반 Non-blocking I/O.",
        "en": "Modern C++20 asynchronous network library. Supports <strong>TCP/UDP, HTTP/1.1, WebSocket, TLS 1.3</strong>. ASIO-based Non-blocking I/O."
      },
      "tags": ["C++20", "ASIO", "WebSocket", "TLS 1.3"],
      "expanded": {
        "features": {
          "ko": [
            "TCP/UDP 소켓 통신",
            "HTTP/1.1 클라이언트/서버",
            "WebSocket 양방향 통신",
            "TLS 1.3 보안 연결"
          ],
          "en": [
            "TCP/UDP socket communication",
            "HTTP/1.1 client/server",
            "WebSocket bidirectional communication",
            "TLS 1.3 secure connection"
          ]
        }
      }
    },
    {
      "id": "pacs-system",
      "title": "pacs_system",
      "github": "https://github.com/kcenon/pacs_system",
      "description": {
        "ko": "Modern C++20 PACS. <strong>외부 DICOM 라이브러리 없이</strong> kcenon 생태계만으로 구축. 고성능 비동기 I/O, SIMD 가속.",
        "en": "Modern C++20 PACS. Built <strong>without external DICOM libraries</strong> using only kcenon ecosystem. High-performance async I/O, SIMD acceleration."
      },
      "tags": ["C++20", "DICOM", "PACS", "SIMD"],
      "expanded": {
        "features": {
          "ko": [
            "순수 C++20 DICOM 구현",
            "외부 라이브러리 의존성 제거",
            "SIMD 가속 영상 처리",
            "비동기 네트워크 I/O"
          ],
          "en": [
            "Pure C++20 DICOM implementation",
            "No external library dependencies",
            "SIMD accelerated image processing",
            "Asynchronous network I/O"
          ]
        }
      }
    },
    {
      "id": "logger-system",
      "title": "logger_system",
      "github": "https://github.com/kcenon/logger_system",
      "description": {
        "ko": "비동기 로깅 프레임워크. <strong>4.34M msg/sec</strong> 처리량. 구조화된 로깅, 다중 출력, 로그 레벨 지원.",
        "en": "Asynchronous logging framework. <strong>4.34M msg/sec</strong> throughput. Structured logging, multiple outputs, log level support."
      },
      "tags": ["C++20", "Async", "High-throughput"],
      "expanded": {
        "features": {
          "ko": [
            "초당 434만 메시지 처리",
            "비동기 I/O 기반",
            "Zero-copy 최적화"
          ],
          "en": [
            "4.34 million messages per second",
            "Based on asynchronous I/O",
            "Zero-copy optimization"
          ]
        }
      }
    },
    {
      "id": "database-system",
      "title": "database_system",
      "github": "https://github.com/kcenon/database_system",
      "description": {
        "ko": "경량 C++20 Core DAL 라이브러리. 타입 안전 쿼리, 커넥션 풀링, 트랜잭션 관리.",
        "en": "Lightweight C++20 Core DAL library. Type-safe queries, connection pooling, transaction management."
      },
      "tags": ["C++20", "DAL", "Type-safe"],
      "expanded": {
        "features": {
          "ko": [
            "헤더 전용 경량 라이브러리",
            "타입 안전 쿼리 빌더",
            "자동 커넥션 풀 관리"
          ],
          "en": [
            "Header-only lightweight library",
            "Type-safe query builder",
            "Automatic connection pool management"
          ]
        }
      }
    }
  ]
},

  career: {
  "timeline": [
    {
      "id": "pozalabs",
      "company": { "ko": "포자랩스", "en": "Poza Labs" },
      "period": "2023.01 - 2025.02",
      "role": { "ko": "소프트웨어 아키텍트", "en": "Software Architect" },
      "companyDescription": {
        "ko": "AI를 통한 음악 작곡 자동화 시스템 개발 스타트업",
        "en": "Startup developing AI-powered music composition automation systems"
      },
      "responsibilities": {
        "ko": "오디오 렌더링 SaaS Architecture 설계, 폴리글랏으로 설계된 서비스 오케스트레이션 및 CI/CD 구성",
        "en": "Audio rendering SaaS Architecture design, polyglot service orchestration and CI/CD configuration"
      },
      "scale": {
        "company": { "ko": "75명", "en": "75 employees" },
        "team": { "ko": "3명", "en": "3 members" }
      },
      "leaveReason": {
        "ko": "시리즈 B 단계로 투자 유치 실패, 운영 자금 부족으로 개발 인원 대부분 정리해고",
        "en": "Series B funding failed, most developers laid off due to lack of operating funds"
      },
      "note": {
        "ko": "<strong>경험 확장</strong>: 의료 도메인에서 쌓은 역량을 바탕으로 <strong>AI/ML 파이프라인</strong> 및 <strong>클라우드 네이티브 아키텍처</strong>(AWS, Docker, Kubernetes)를 실무에 적용. On-premise 중심의 의료 시스템 경험을 클라우드 환경으로 확장하여, 향후 <strong>클라우드 기반 의료 AI 시스템</strong> 설계에 기여할 수 있는 역량 확보.",
        "en": "<strong>Experience Expansion</strong>: Applied <strong>AI/ML pipeline</strong> and <strong>cloud-native architecture</strong> (AWS, Docker, Kubernetes) in production, building on medical domain expertise. Extended on-premise medical system experience to cloud environments, gaining capabilities for future <strong>cloud-based medical AI system</strong> design."
      },
      "tags": ["Rust", "Go", "C++", "System Architecture", "AWS", "AI/ML Pipeline"],
      "relatedProjects": ["prs-server", "ars-system"],
      "highlight": false
    },
    {
      "id": "purplechips",
      "company": { "ko": "퍼플칩스 (POSTECH)", "en": "Purplechips (POSTECH)" },
      "period": { "ko": "2022.03 - 2022.10 (8개월)", "en": "2022.03 - 2022.10 (8 months)" },
      "role": { "ko": "리드 프로그래머", "en": "Lead Programmer" },
      "companyDescription": {
        "ko": "POSTECH과 POSCO의 합작 벤처로 기획된 AI 기반 EDA 스타트업",
        "en": "AI-based EDA startup planned as a joint venture between POSTECH and POSCO"
      },
      "responsibilities": {
        "ko": "AI 작업에 대한 서빙 시스템 Architecture 설계/구현",
        "en": "AI job serving system architecture design and implementation"
      },
      "scale": {
        "company": { "ko": "5명", "en": "5 employees" },
        "team": { "ko": "2명", "en": "2 members" }
      },
      "leaveReason": {
        "ko": "사업 아이템을 제공한 POSTECH 교수(CTO)가 PoC 실패 이후 사업 철수 선언",
        "en": "POSTECH professor (CTO) who provided the business idea declared business withdrawal after PoC failure"
      },
      "note": {
        "ko": "<strong>경험 확장</strong>: 의료 도메인에서 <strong>반도체/AI 도메인</strong>으로 전환하여 딥러닝 기반 알고리즘과 대규모 데이터 처리 파이프라인 구축 경험 획득. 이 경험을 통해 AI/ML 기술을 의료 영상 분석에 적용할 수 있는 역량 확보.",
        "en": "<strong>Experience Expansion</strong>: Transitioned from medical to <strong>semiconductor/AI domain</strong>, gaining experience in deep learning algorithms and large-scale data processing pipelines. Acquired capabilities to apply AI/ML technologies to medical image analysis."
      },
      "tags": ["Python", "C++", "Deep Learning", "EDA", "AI/ML Pipeline", "System Architecture", "ISO 26262"],
      "relatedProjects": ["eda-ai-server"],
      "highlight": false
    },
    {
      "id": "ray",
      "company": { "ko": "(주)레이", "en": "Ray Co., Ltd." },
      "period": "2010.02 - 2022.03",
      "role": { "ko": "리드 소프트웨어 엔지니어 → 수석 엔지니어", "en": "Lead Software Engineer → Principal Engineer" },
      "badge": "IPO",
      "companyDescription": {
        "ko": "삼성전자 의료사업부 자회사에서 분사한 치과 의료영상 시스템 전문 기업",
        "en": "Dental medical imaging company spun off from Samsung Electronics Medical Division"
      },
      "responsibilities": {
        "ko": "PACS, DICOM 뷰어, 영상 획득 장비 제어, 영상 관리/전송 서버 Architecture 설계/구현",
        "en": "PACS, DICOM viewer, image acquisition equipment control, image management/transfer server architecture design and implementation"
      },
      "scale": {
        "company": { "ko": "약 300명", "en": "~300 employees" },
        "team": { "ko": "11명", "en": "11 members" }
      },
      "leaveReason": {
        "ko": "새로운 분야에 대한 도전",
        "en": "Seeking new challenges in different domains"
      },
      "tags": ["C++", "C#", "DICOM", "PACS", "System Architecture", "ISO 13485", "IEC 62304", "ISO 14971"],
      "relatedProjects": ["smartdent-v3", "samsung-ct", "alpha-project", "dicom-visualization", "3d-visualization", "automation-alignment", "intraoral-sensor-sdk", "3d-printer", "high-speed-download"],
      "highlight": true
    },
    {
      "id": "tilon",
      "company": { "ko": "(주)틸론", "en": "Tilon Co., Ltd." },
      "period": { "ko": "2009.07 - 2009.12 (6개월)", "en": "2009.07 - 2009.12 (6 months)" },
      "role": { "ko": "시니어 프로그래머", "en": "Senior Programmer" },
      "companyDescription": {
        "ko": "시스템 가상화 및 망분리 시스템 개발 벤처 기업",
        "en": "Venture company developing system virtualization and network separation systems"
      },
      "scale": {
        "company": { "ko": "약 30명", "en": "~30 employees" },
        "team": { "ko": "5명", "en": "5 members" }
      },
      "leaveReason": {
        "ko": "경영진 간 비전 차이로 안정적인 개발 환경 확보가 어려워 새로운 기회 모색",
        "en": "Sought new opportunities due to leadership alignment challenges affecting development environment stability"
      },
      "tags": ["C++", "Windows Driver", "Virtualization", "System Programming"],
      "highlight": false
    },
    {
      "id": "vatech-ewoo",
      "company": { "ko": "(주)바텍이우홀딩스", "en": "VATECH E-WOO Holdings" },
      "period": "2008.10 - 2009.07",
      "role": { "ko": "시니어 소프트웨어 엔지니어", "en": "Senior Software Engineer" },
      "companyDescription": {
        "ko": "바텍에서 이우로 자회사 보직 이동",
        "en": "Transferred to E-WOO subsidiary from VATECH"
      },
      "scale": {
        "company": { "ko": "약 600명", "en": "~600 employees" },
        "team": { "ko": "10명", "en": "10 members" }
      },
      "leaveReason": {
        "ko": "새로운 분야에 대한 도전",
        "en": "Seeking new challenges in different domains"
      },
      "tags": ["C++", "DICOM", "X-ray", "CBCT", "CE/FDA/KFDA"],
      "relatedProjects": ["sherpa"],
      "highlight": false
    },
    {
      "id": "vatech",
      "company": { "ko": "(주)바텍", "en": "VATECH Co., Ltd." },
      "period": "2004.07 - 2008.10",
      "role": { "ko": "소프트웨어 엔지니어", "en": "Software Engineer" },
      "badge": "IPO",
      "companyDescription": {
        "ko": "치과용 X-ray 및 CBCT 의료영상 장비 전문 기업",
        "en": "Company specializing in dental X-ray and CBCT medical imaging equipment"
      },
      "scale": {
        "company": { "ko": "약 300명", "en": "~300 employees" },
        "team": { "ko": "5명", "en": "5 members" }
      },
      "leaveReason": {
        "ko": "계열사 이동으로 인한 전배처리",
        "en": "Transfer to affiliate company"
      },
      "tags": ["C++", "DICOM", "X-ray", "CBCT", "CE/FDA/KFDA"],
      "relatedProjects": ["implagraphy", "ezceph", "orthovision", "easydent"],
      "highlight": false
    },
    {
      "id": "inje",
      "company": { "ko": "인제대학교", "en": "Inje University" },
      "period": "1997.03 - 2005.08",
      "role": { "ko": "전자공학과 학사", "en": "Bachelor of Science in Electronic Engineering" },
      "highlight": false
    }
  ]
},

  testimonials: {
  "featured": {
    "quote": {
      "ko": "동철님은 제가 함께 일한 <strong>가장 모범적이고 뛰어난 기술 리더</strong>입니다. 특히 대규모 시스템과 온프레미스 환경에서 방대한 지식을 얻었습니다. 그가 회사에 제공한 툴킷은 매우 사용하기 쉬워 많은 주니어 개발자들에게 큰 도움이 되었습니다.",
      "en": "Mr. Dongcheol is <strong>the most exemplary and outstanding tech leader</strong> I have ever worked with. I gained extensive knowledge, particularly in large-scale systems and on-premise environments. The toolkit he provided to the company was incredibly user-friendly, greatly benefiting many junior developers."
    },
    "author": { "ko": "이현규", "en": "Hyunkyu Lee" },
    "role": { "ko": "소프트웨어 개발자", "en": "Software Developer" },
    "relation": { "ko": "2024.08 · 같은 부서", "en": "2024.08 · Same department" },
    "labels": [
      { "text": { "ko": "기술 리더십", "en": "Tech Leadership" }, "type": "leadership" },
      { "text": { "ko": "대규모 시스템", "en": "Large-scale Systems" }, "type": "technical" },
      { "text": { "ko": "멘토링", "en": "Mentoring" }, "type": "mentoring" }
    ]
  },
  "testimonials": [
    {
      "id": 1,
      "date": "2022.02",
      "context": { "ko": "부하직원", "en": "Direct report" },
      "text": {
        "ko": "신동철팀장님께서는 의료 분야 소프트웨어 엔지니어로서 필요한 의료 도메인 지식을 넓고 깊게 알고 계십니다. <strong>리드 프로그래머로서 책임감</strong>을 가지고 프로그램을 개발하면서도, 아래 직급의 사람이 의견을 내도 타당할 경우 해당내용을 수용해주시며 <strong>다른 팀원들의 실력 향상을 위해 노력</strong>하십니다.",
        "en": "Mr. Shin possesses extensive and deep medical domain knowledge required for medical software engineering. He develops programs with <strong>responsibility as a lead programmer</strong>, yet accepts valid opinions from junior staff and <strong>strives to improve team members' skills</strong>."
      },
      "labels": [
        { "text": { "ko": "의료 도메인", "en": "Medical Domain" }, "type": "domain" },
        { "text": { "ko": "리더십", "en": "Leadership" }, "type": "leadership" },
        { "text": { "ko": "팀 성장", "en": "Team Growth" }, "type": "mentoring" }
      ],
      "author": { "ko": "박석준", "en": "Seokjun Park" },
      "role": { "ko": "(주)레이", "en": "Ray Co., Ltd." },
      "relation": { "ko": "Ray 팀원", "en": "Ray team member" }
    },
    {
      "id": 2,
      "date": "2025.03",
      "context": { "ko": "같은 부서", "en": "Same department" },
      "text": {
        "ko": "<strong>마이크로서비스 기반의 대규모 시스템 아키텍처 설계</strong>에 특화된 훌륭한 시니어 소프트웨어 엔지니어입니다. 새로운 기술을 배우는 데 열린 자세를 가지고 있으며, 이를 실제 프로젝트에 적용할 수 있는 능력을 갖추고 있습니다. 그의 풍부한 경험은 제가 해결책을 찾는 데 여러 번 도움이 되었습니다.",
        "en": "A great senior software engineer with specialty in <strong>large system architecture designs based on microservices</strong>. He's open to learn new skills and capable to apply them to real-world projects. His extensive experience has helped me many times in finding solutions."
      },
      "labels": [
        { "text": { "ko": "마이크로서비스", "en": "Microservices" }, "type": "technical" },
        { "text": { "ko": "멘토링", "en": "Mentoring" }, "type": "mentoring" }
      ],
      "author": { "ko": "송현진", "en": "Hyunjin Song" },
      "role": { "ko": "S/W 엔지니어, C++ 및 Rust", "en": "S/W Engineer, C++ and Rust" },
      "relation": { "ko": "Poza Labs 동료", "en": "Poza Labs colleague" }
    },
    {
      "id": 3,
      "date": "2022.05",
      "context": { "ko": "팀은 다름", "en": "Different team" },
      "text": {
        "ko": "<strong>동료들이 스스로 문제를 해결할 수 있도록 큰 방향을 제시하는 능력</strong>이 탁월합니다. 의료 소프트웨어, 특히 치과 분야에서 풍부한 경험과 깊은 지식을 가지고 있습니다. 항상 새로운 기술을 배우려 노력하며, 새로운 기술을 적용하는 것에 두려움이나 거부감이 없습니다.",
        "en": "Ability to <strong>provide a big direction for co-workers to solve problems on their own</strong> is excellent. He has a lot of experience and deep knowledge in medical software, especially dentistry. He is always trying to learn new skills, and has no fear or reluctance to apply new skills."
      },
      "labels": [
        { "text": { "ko": "의료/치과", "en": "Medical/Dental" }, "type": "domain" },
        { "text": { "ko": "방향 제시", "en": "Direction" }, "type": "leadership" }
      ],
      "author": { "ko": "민경욱", "en": "Gyeong Uk Min" },
      "role": { "ko": "치과 소프트웨어", "en": "Dental Software" },
      "relation": { "ko": "Ray 협업 동료", "en": "Ray collaboration colleague" }
    },
    {
      "id": 4,
      "date": "2022.10",
      "context": { "ko": "같은 부서", "en": "Same department" },
      "text": {
        "ko": "제가 함께 일한 C++ 엔지니어 중 가장 사려 깊은 분입니다. Python으로 작성된 AI 모듈을 C++ 프로그램에 통합하는 작업을 함께 했습니다. <strong>이해하기 쉬운 코드를 작성하고 유지보수가 용이하도록 프로그램을 구축하는 것</strong>이 그의 많은 전문 분야 중 가장 두드러진 점입니다.",
        "en": "The most thoughtful C++ engineer I've ever worked with. I worked with him to integrate the AI modules written in Python into the C++ program. <strong>Writing comprehensible code and building programs to make it easier to maintain</strong> are the most distinctive of his many specialties."
      },
      "labels": [
        { "text": { "ko": "C++ 전문가", "en": "C++ Expert" }, "type": "technical" },
        { "text": { "ko": "코드 품질", "en": "Code Quality" }, "type": "technical" }
      ],
      "author": { "ko": "김준엽", "en": "Junyaup Kim" },
      "role": { "ko": "Watsonx 고객 성공 매니저", "en": "Watsonx Customer Success Manager" },
      "relation": { "ko": "Ray 동료", "en": "Ray colleague" }
    },
    {
      "id": 5,
      "date": "2014.05",
      "context": { "ko": "클라이언트", "en": "Client" },
      "text": {
        "ko": "제가 본 엔지니어 중 최고입니다. <strong>단기간에 데이터베이스 서비스를 처음부터 구축</strong>하는 것은 대단한 성과인데, 신 씨는 이를 쉽게 해냈습니다. 삼성에서 근무하는 동안 항상 더 나은 성과를 내기 위해 자신을 밀어붙였고, 지속적으로 더 좋은 결과를 달성했습니다.",
        "en": "One of the best engineers I have seen. Writing up a <strong>Database Service from scratch in a short term</strong> is quite an accomplishment and Mr Shin did it with ease. He has pushed himself all the time to perform better and has continuously achieved better results during his tenure with us at Samsung."
      },
      "labels": [
        { "text": { "ko": "빠른 구현", "en": "Fast Delivery" }, "type": "technical" },
        { "text": { "ko": "자기 개선", "en": "Self-improvement" }, "type": "leadership" }
      ],
      "author": "Nasir Ahmed Desai",
      "role": { "ko": "DeepHealth 정보학 소프트웨어 리더", "en": "Informatics Software Leader, DeepHealth" },
      "relation": { "ko": "Samsung 클라이언트", "en": "Samsung client" }
    },
    {
      "id": 6,
      "date": "2013.10",
      "context": { "ko": "같은 부서", "en": "Same department" },
      "text": {
        "ko": "깊은 기술 지식을 가진 매우 재능 있는 분입니다. DICOM 플랫폼 팀에 합류하여 바로 어려운 컴포넌트를 맡았습니다. 그리고 <strong>성능 스펙을 2배로 최적화</strong>했습니다. 그의 커뮤니케이션 능력은 높이 평가받고 있습니다.",
        "en": "A very talented person with deep technical knowledge. He joined DICOM Platform team and took over a challenging component right away. He went ahead and <strong>optimized the performance spec by 2x</strong>. His communication skills are well appreciated."
      },
      "labels": [
        { "text": { "ko": "성능 2배", "en": "Performance 2x" }, "type": "technical" },
        { "text": { "ko": "커뮤니케이션", "en": "Communication" }, "type": "communication" }
      ],
      "author": "Rakesh Dutta",
      "role": { "ko": "Stryker Robotics R&D 디렉터", "en": "Director, R&D at Stryker Robotics" },
      "relation": { "ko": "Samsung 동료", "en": "Samsung colleague" }
    },
    {
      "id": 7,
      "date": "2022.05",
      "context": { "ko": "직속상사", "en": "Direct manager" },
      "text": {
        "ko": "항상 새로운 기술을 배우고 업무에 적용하려고 노력합니다. <strong>마이크로서비스 기반의 새로운 치과 영상 서버 및 애플리케이션</strong> 개발 프로젝트는 성능, 확장성, 유지보수성 면에서 성공적이었습니다. 어떤 개발 팀에서도 좋은 팀원이 될 것이라고 확신합니다.",
        "en": "He always tries to learn about new technologies and apply them to his work. The project to develop new <strong>dental imaging server and application based on microservices</strong> was successful in performance, scalability and maintainability. I'm sure he would be a good teammate on any development team."
      },
      "labels": [
        { "text": { "ko": "마이크로서비스", "en": "Microservices" }, "type": "technical" },
        { "text": { "ko": "지속적 학습", "en": "Continuous Learning" }, "type": "mentoring" }
      ],
      "author": { "ko": "이철현", "en": "Chulhyun(Charles) Lee" },
      "role": { "ko": "시니어 테크니컬 프로덕트 매니저", "en": "Senior Technical Product Manager" },
      "relation": { "ko": "Ray 직속상사", "en": "Ray direct manager" }
    },
    {
      "id": 8,
      "date": "2022.10",
      "context": { "ko": "팀은 다름", "en": "Different team" },
      "text": {
        "ko": "<strong>대용량 전송 또는 실시간 처리</strong> 분야에서 뛰어난 역량을 보유하고 있습니다. 새로운 기술을 습득하고 프로젝트에 반영하는 것을 좋아합니다. 코드를 개선하려는 노력을 게을리하지 않습니다. 의료 영상 전송 협업에서 많은 영감을 받았습니다.",
        "en": "Excellent capabilities in the field of <strong>large-capacity transmission or real-time processing</strong>. He also likes to acquire new skills and reflect them in projects. He never neglects his efforts to improve his code. I got a lot of inspiration collaborating with him on medical image transmission."
      },
      "labels": [
        { "text": { "ko": "실시간", "en": "Real-time" }, "type": "technical" },
        { "text": { "ko": "고처리량", "en": "High-throughput" }, "type": "technical" }
      ],
      "author": { "ko": "강동근", "en": "DongKeun Kang" },
      "role": { "ko": "소프트웨어 엔지니어", "en": "Software Engineer" },
      "relation": { "ko": "Ray 협업 동료", "en": "Ray collaboration colleague" }
    },
    {
      "id": 9,
      "date": "2021.02",
      "context": { "ko": "직장선배", "en": "Senior colleague" },
      "text": {
        "ko": "의료 영상 분야에서 풍부한 경험을 가진 매우 잘 훈련된 프로그래머입니다. 무엇보다도 <strong>지식에 대한 열정</strong>이 있습니다. 그래서 새로운 기술을 도입하는 데 매우 뛰어납니다. 일반 애플리케이션 프로그래밍과 의료 영상 분야에서 그를 추천합니다.",
        "en": "A lot of experiences in medical imaging field and a very well trained programmer. Most of all, <strong>he is eager for knowledge</strong>. So he can be very good in adopting new technologies. I recommend him in general application programming and medical imaging field."
      },
      "labels": [
        { "text": { "ko": "의료 영상", "en": "Medical Imaging" }, "type": "domain" },
        { "text": { "ko": "학습 열정", "en": "Eager to Learn" }, "type": "mentoring" }
      ],
      "author": { "ko": "이우석", "en": "Wooseok Lee" },
      "role": { "ko": "Lunit 소프트웨어 개발자", "en": "Lunit Software Developer" },
      "relation": { "ko": "VATECH 직장선배", "en": "VATECH senior colleague" }
    }
  ]
},

  expertise: {
  "categories": [
    {
      "id": "medical",
      "icon": "hospital",
      "title": { "ko": "의료 시스템", "en": "Medical Systems" },
      "items": {
        "ko": [
          "PACS (의료영상 저장전송 시스템)",
          "DICOM 표준 구현",
          "3D 볼륨 렌더링 & MPR",
          "모달리티 장비 제어",
          "HIS/RIS Integration (HL7, FHIR)",
          "교정 시뮬레이션"
        ],
        "en": [
          "PACS (Picture Archiving & Communication System)",
          "DICOM Standard Implementation",
          "3D Volume Rendering & MPR",
          "Modality Equipment Control",
          "HIS/RIS Integration (HL7, FHIR)",
          "Orthodontic Simulation"
        ]
      }
    },
    {
      "id": "regulatory",
      "icon": "clipboard",
      "title": { "ko": "규제 & 컴플라이언스", "en": "Regulatory & Compliance" },
      "items": {
        "ko": [
          "ISO 13485 (의료기기 품질경영시스템)",
          "IEC 62304 (의료기기 SW 생명주기)",
          "FDA 510(k) / KFDA (식약처)",
          "CE Marking (유럽) / CCC (중국)",
          "<strong>HIPAA Controls</strong> (PHI 보안, 감사 로깅)",
          "소프트웨어 위험 관리 (ISO 14971)",
          "설계 통제 문서화 (Design Control)"
        ],
        "en": [
          "ISO 13485 (Medical Device QMS)",
          "IEC 62304 (Medical Device SW Lifecycle)",
          "FDA 510(k) / KFDA (Korea FDA)",
          "CE Marking (EU) / CCC (China)",
          "<strong>HIPAA Controls</strong> (PHI security, audit logging)",
          "Software Risk Management (ISO 14971)",
          "Design Control Documentation"
        ]
      }
    },
    {
      "id": "documentation",
      "icon": "file-text",
      "title": { "ko": "규제 문서 작성", "en": "Regulatory Documentation" },
      "items": {
        "ko": [
          "SRS (소프트웨어 요구사항 명세서)",
          "SDS (소프트웨어 설계 명세서)",
          "소프트웨어 아키텍처 문서",
          "위험 분석 (ISO 14971 / FMEA)",
          "추적성 매트릭스 (요구사항 ↔ 설계 ↔ 테스트)",
          "검증 & 유효성 확인(V&V) 프로토콜/리포트",
          "단위/통합 테스트 명세서",
          "SOUP 분석 (미확인 출처 소프트웨어)",
          "릴리즈 노트 & 변경 이력"
        ],
        "en": [
          "SRS (Software Requirements Specification)",
          "SDS (Software Design Specification)",
          "Software Architecture Documents",
          "Risk Analysis (ISO 14971 / FMEA)",
          "Traceability Matrix (Requirements ↔ Design ↔ Test)",
          "Verification & Validation (V&V) protocols/reports",
          "Unit/Integration Test Specifications",
          "SOUP (Software of Unknown Provenance) analysis",
          "Release notes & change history"
        ]
      }
    },
    {
      "id": "distributed",
      "icon": "git-branch",
      "title": { "ko": "분산 시스템", "en": "Distributed Systems" },
      "items": {
        "ko": [
          "서비스 디스커버리 & 로드 밸런싱",
          "메시지 큐 (RabbitMQ, 자체 구현)",
          "이벤트 기반 아키텍처 / CQRS",
          "데이터베이스 샤딩 & 복제",
          "분산 트랜잭션 (Saga 패턴)",
          "서킷 브레이커 & 재시도 패턴",
          "최종 일관성 & 충돌 해결",
          "무중단 배포 (Blue-Green, Canary)"
        ],
        "en": [
          "Service discovery & load balancing",
          "Message queues (RabbitMQ, custom implementation)",
          "Event-driven architecture / CQRS",
          "Database sharding & replication",
          "Distributed transactions (Saga pattern)",
          "Circuit breaker & retry patterns",
          "Eventual consistency & conflict resolution",
          "Zero-downtime deployment (Blue-Green, Canary)"
        ]
      }
    },
    {
      "id": "cloud",
      "icon": "cloud",
      "title": { "ko": "클라우드 & DevOps", "en": "Cloud & DevOps" },
      "items": {
        "ko": [
          "AWS 기반 서비스 설계 및 운영",
          "Docker 기반 컨테이너 배포",
          "Kubernetes 마이그레이션 설계",
          "CI/CD (Daily Release)",
          "관측성 (OpenTelemetry, tracing/metrics/logging)",
          "모니터링 & 알림"
        ],
        "en": [
          "AWS-based service architecture & operations",
          "Containerized deployment with Docker",
          "Kubernetes migration design",
          "CI/CD (Daily Release)",
          "Observability (OpenTelemetry, tracing/metrics/logging)",
          "Monitoring & alerting"
        ]
      }
    },
    {
      "id": "security",
      "icon": "shield",
      "title": { "ko": "보안 & 개인정보", "en": "Security & Privacy" },
      "items": {
        "ko": [
          "PHI/PII 암호화 (전송/저장)",
          "감사 로그(Audit Logging) 설계",
          "접근 통제 및 권한 모델",
          "시크릿/키 관리 (운영 관점)",
          "HIPAA 기술적 보호조치 적용 경험"
        ],
        "en": [
          "PHI/PII encryption (in transit/at rest)",
          "Audit logging design",
          "Access control & authorization model",
          "Secrets/keys handling (operational)",
          "HIPAA safeguard implementation experience"
        ]
      }
    },
    {
      "id": "performance",
      "icon": "zap",
      "title": { "ko": "고성능 시스템", "en": "High Performance Systems" },
      "items": {
        "ko": [
          "Lock-free 자료구조",
          "SIMD 최적화",
          "비동기 I/O & 이벤트 기반 아키텍처",
          "메모리 효율적 설계",
          "마이크로초 단위 저지연 시스템",
          "프로파일링 & 성능 튜닝"
        ],
        "en": [
          "Lock-free data structures",
          "SIMD optimization",
          "Async I/O & event-driven architecture",
          "Memory-efficient design",
          "Microsecond-level low-latency systems",
          "Profiling & performance tuning"
        ]
      }
    },
    {
      "id": "technologies",
      "icon": "tool",
      "title": { "ko": "기술 스택", "en": "Technologies" },
      "tags": [
        "C++20", "C#/.NET", "Rust", "Python", "Go", "TypeScript",
        "Qt", "WPF/MVVM", "OpenGL", "OpenCV",
        "PostgreSQL", "Redis", "RabbitMQ",
        "Docker", "Kubernetes", "AWS", "OpenTelemetry"
      ]
    }
  ],
  "certifications": [
    { "icon": "EU", "name": "CE" },
    { "icon": "US", "name": "FDA" },
    { "icon": "KR", "name": "KFDA" },
    { "icon": "CN", "name": "CCC" },
    { "icon": "US", "name": "HIPAA Controls" }
  ],
  "heroCapabilities": [
    { "icon": "check-circle", "title": { "ko": "Full Lifecycle", "en": "Full Lifecycle" }, "description": { "ko": "IEC 62304 기반 전 개발 단계 수행", "en": "Complete IEC 62304 development phases" } },
    { "icon": "file-text", "title": { "ko": "Regulatory Docs", "en": "Regulatory Docs" }, "description": { "ko": "ISO 13485, IEC 62304 규격 문서 작성", "en": "ISO 13485, IEC 62304 documentation" } },
    { "icon": "users", "title": { "ko": "Team Leadership", "en": "Team Leadership" }, "description": { "ko": "코드 리뷰와 멘토링 기반 팀 성장", "en": "Team growth through code review & mentoring" } },
    { "icon": "check-square", "title": { "ko": "Clinical Validation", "en": "Clinical Validation" }, "description": { "ko": "임상 시험 및 검증 단계 완수", "en": "Clinical trials & validation completion" } }
  ],
  "lifecycleDetails": [
    { "icon": "clipboard", "title": { "ko": "문서화", "en": "Documentation" }, "description": { "ko": "SRS, SDS, 위험분석, 추적성 매트릭스 등 IEC 62304 필수 문서 작성", "en": "IEC 62304 required documents: SRS, SDS, risk analysis, traceability matrix" } },
    { "icon": "search", "title": { "ko": "검증 & 확인", "en": "Verification & Validation" }, "description": { "ko": "각 단계별 검증 활동 및 독립적인 유효성 확인 수행", "en": "Verification activities per phase and independent validation" } },
    { "icon": "alert-triangle", "title": { "ko": "위험 관리", "en": "Risk Management" }, "description": { "ko": "ISO 14971 기반 소프트웨어 위험 분석 및 완화 조치", "en": "ISO 14971-based software risk analysis and mitigation" } },
    { "icon": "refresh-cw", "title": { "ko": "변경 관리", "en": "Change Management" }, "description": { "ko": "체계적인 변경 통제 및 영향 분석 프로세스", "en": "Systematic change control and impact analysis process" } },
    { "icon": "users", "title": { "ko": "SQA 협업", "en": "SQA Collaboration" }, "description": { "ko": "SQA 팀과 긴밀히 협업하여 품질 보증 프로세스 수립 및 준수", "en": "Close collaboration with SQA team for quality assurance process" } },
    { "icon": "flask", "title": { "ko": "테스트 자동화", "en": "Test Automation" }, "description": { "ko": "단위 테스트 기반 자동화 검증 강화로 회귀 오류 방지 및 품질 향상", "en": "Enhanced automated verification with unit tests to prevent regression and improve quality" } }
  ]
},

  manager: {
    pmCapabilities: [
      {
        id: "team-management",
        icon: "users",
        title: { ko: "팀 관리", en: "Team Management" },
        description: { ko: "2~11명 규모 개발팀 리딩 및 주니어 개발자 멘토링", en: "Led development teams of 2-11 members and mentored junior developers" },
        metrics: { teamSizes: [2, 3, 4, 5, 6, 10, 11], yearsLeading: 14, projectsLed: 10 }
      },
      {
        id: "stakeholder-management",
        icon: "handshake",
        title: { ko: "스테이크홀더 관리", en: "Stakeholder Management" },
        description: { ko: "내외부 이해관계자와의 효과적인 커뮤니케이션 및 협업", en: "Effective communication and collaboration with internal and external stakeholders" },
        stakeholderTypes: { ko: ["클라이언트", "인증 심사관", "QA팀", "경영진", "글로벌 파트너"], en: ["Clients", "Certification Auditors", "QA Team", "Management", "Global Partners"] }
      },
      {
        id: "project-delivery",
        icon: "calendar-check",
        title: { ko: "프로젝트 딜리버리", en: "Project Delivery" },
        description: { ko: "복잡한 프로젝트의 일정 관리 및 성공적 납품", en: "Schedule management and successful delivery of complex projects" },
        metrics: { onTimeDelivery: "90%+", certificationSuccess: "100%", majorProjects: 15 }
      },
      {
        id: "risk-management",
        icon: "shield",
        title: { ko: "리스크 관리", en: "Risk Management" },
        description: { ko: "프로젝트 리스크 식별, 평가 및 완화 전략 수립", en: "Project risk identification, assessment, and mitigation strategy development" },
        frameworks: ["ISO 14971", "FMEA", "Traceability Matrix"]
      },
      {
        id: "process-improvement",
        icon: "trending-up",
        title: { ko: "프로세스 개선", en: "Process Improvement" },
        description: { ko: "개발 프로세스 및 품질 시스템 구축과 개선", en: "Development process and quality system establishment and improvement" }
      }
    ],
    leadershipStyle: {
      title: { ko: "리더십 스타일", en: "Leadership Style" },
      principles: {
        ko: [
          "동료들이 스스로 문제를 해결할 수 있도록 큰 방향 제시",
          "아래 직급의 의견도 타당할 경우 적극 수용",
          "코드 리뷰와 멘토링 기반 팀 성장 추구",
          "새로운 기술 도입에 대한 열린 자세"
        ],
        en: [
          "Provide direction for colleagues to solve problems independently",
          "Accept valid opinions from junior staff",
          "Pursue team growth through code review and mentoring",
          "Open attitude toward adopting new technologies"
        ]
      }
    },
    businessImpact: {
      highlights: {
        ko: [
          "글로벌 4대 시장 인증 획득 (CE/FDA/KFDA/CCC)",
          "2개 회사 IPO 기여 (VATECH, Ray)",
          "처리량 2배, 지연시간 50% 개선",
          "삼성전자 등 대형 클라이언트 프로젝트 성공적 납품"
        ],
        en: [
          "4 major global market certifications (CE/FDA/KFDA/CCC)",
          "Contributed to 2 company IPOs (VATECH, Ray)",
          "2x throughput, 50% latency improvement",
          "Successful delivery of major client projects including Samsung"
        ]
      },
      keyNumbers: {
        certifications: 4,
        ipos: 2,
        performanceImprovement: "2x",
        latencyReduction: "50%",
        projectsDelivered: "15+"
      }
    },
    softSkills: [
      { id: "communication", icon: "message-circle", title: { ko: "커뮤니케이션", en: "Communication" }, level: 5 },
      { id: "mentoring", icon: "users", title: { ko: "멘토링", en: "Mentoring" }, level: 5 },
      { id: "problem-solving-direction", icon: "compass", title: { ko: "문제 해결 방향 제시", en: "Problem-Solving Direction" }, level: 5 },
      { id: "continuous-learning", icon: "book-open", title: { ko: "지속적 학습", en: "Continuous Learning" }, level: 5 },
      { id: "openness", icon: "unlock", title: { ko: "열린 자세", en: "Openness" }, level: 5 },
      { id: "code-quality-focus", icon: "check-circle", title: { ko: "코드 품질 중시", en: "Code Quality Focus" }, level: 5 }
    ],
    managementProjects: [
      {
        projectId: "smartdent-v3",
        title: "SMARTDent v3",
        duration: { ko: "18개월", en: "18 months" },
        teamSize: 6,
        onTime: true,
        certifications: ["CE", "FDA 510(k)", "KFDA", "CCC"],
        outcomes: { ko: ["처리량 2배 향상", "지연시간 50% 감소", "4개국 글로벌 시장 진출"], en: ["2x throughput improvement", "50% latency reduction", "4-country global market entry"] }
      },
      {
        projectId: "alpha-project",
        title: "Alpha Project",
        duration: { ko: "22개월", en: "22 months" },
        teamSize: 4,
        onTime: true,
        certifications: ["CE", "FDA", "KFDA"]
      },
      {
        projectId: "prs-server",
        title: "PRS Server",
        duration: { ko: "13개월", en: "13 months" },
        teamSize: 3,
        outcomes: { ko: ["Zero-downtime 배포", "Daily Release 확립", "확장성 10배 향상"], en: ["Zero-downtime deployment", "Daily Release cycle", "10x scalability"] }
      }
    ]
  }
};
