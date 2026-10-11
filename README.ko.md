# 신동철

**의료영상, Modern C++ 시스템, AI를 활용한 소프트웨어 개발**에 집중하는 소프트웨어 아키텍트이자 기술 리더입니다.

[English](README.md) · [포트폴리오](https://kcenon.github.io/kcenon/portfolio/) · [LinkedIn](https://www.linkedin.com/in/raphaelshin/) · [이메일](mailto:kcenon@gmail.com)

## 현재 집중하는 분야

2026년 3월부터 [Flonics](https://flonics.co.kr) CTO로 재직하며 의료영상 기반 혈류 진단 솔루션의 개발·운영·기술 관리를 총괄하고 있습니다.

- **의료영상:** DICOM/PACS, 병원 정보 시스템 연동, 테스트 환경.
- **시스템 엔지니어링:** 동시성, 네트워크, 메시징, 데이터 접근, 관측성을 위한 재사용 가능한 C++ 라이브러리.
- **AI 개발 자동화:** 요구사항부터 PR까지의 워크플로, 버전 관리되는 에이전트 설정, 격리된 개발 환경, 생성 결과에 대한 사람의 검토.

## 대표 프로젝트

| 프로젝트 | 역할 | 문서 |
| --- | --- | --- |
| [claude_code_agent](https://github.com/kcenon/claude_code_agent) | Claude Agent SDK 기반 요구사항·문서·구현·PR 에이전트 워크플로. | [개발 개요](https://github.com/kcenon/claude_code_agent/blob/develop/README.md) |
| [pacs_system](https://github.com/kcenon/pacs_system) | DICOM을 자체 구현한 C++20 PACS. 기반 기술과 코덱에는 외부 라이브러리를 사용합니다. | [의존성 명세](https://github.com/kcenon/pacs_system/blob/main/vcpkg.json) |
| [messaging_system](https://github.com/kcenon/messaging_system) | C++20 Pub/Sub, Request/Reply, 이벤트 스트리밍, 메시지 파이프라인. | [개요](https://github.com/kcenon/messaging_system/blob/main/README.md) |
| [thread_system](https://github.com/kcenon/thread_system) | C++20 스레드 풀, 적응형 큐, 취소, 스케줄링. | [기능](https://github.com/kcenon/thread_system/blob/main/docs/FEATURES.md) |
| [network_system](https://github.com/kcenon/network_system) | C++20 비동기 네트워크. 현재 개발 API와 공개 릴리스의 지원 범위는 구분됩니다. | [프로토콜 지원 범위와 제한](https://github.com/kcenon/network_system/blob/main/docs/PROTOCOL_SUPPORT.md) |
| [claude-docker](https://github.com/kcenon/claude-docker) | Claude Code·Codex CLI·Gemini CLI 계정 격리, 공유 소스 또는 작업 트리 환경, Go TUI. | [런타임 지원](https://github.com/kcenon/claude-docker/blob/main/docs/RUNTIMES.md) |

버전 관리되는 AI 워크플로는 [claude-config](https://github.com/kcenon/claude-config), 병원 정보 연동은 [pacs_bridge](https://github.com/kcenon/pacs_bridge), DICOM 통합 테스트는 [dcmtk-docker](https://github.com/kcenon/dcmtk-docker)에서 다룹니다. [vcpkg 레지스트리](https://github.com/kcenon/vcpkg-registry)는 패키지로 배포되는 C++ 라이브러리를 연결합니다.

프로젝트별 상태와 근거 링크는 [포트폴리오 프로젝트 목록](https://kcenon.github.io/kcenon/portfolio/#projects)에서, 전체 목록은 [공개 저장소](https://github.com/kcenon?tab=repositories)에서 확인할 수 있습니다.

## 기술 및 표준 적용 경험

- **언어:** C++ (14/17/20), C#, Rust, Go, Python, TypeScript.
- **시스템:** ASIO, RabbitMQ, Redis, PostgreSQL, OpenTelemetry, Docker, AWS, GitHub Actions.
- **영상 및 UI:** DICOM/PACS, Qt, WPF/MVVM.
- **의료기기 엔지니어링:** IEC 62304, ISO 13485, ISO 14971을 요구사항, 위험 분석, 검증, 추적성, 인허가 문서화에 적용한 경험입니다. 개인 자격증이 아닌 엔지니어링 및 제품 인허가 업무 경험을 설명합니다.

의료기기, 오디오 SaaS, 반도체 EDA, 가상화 분야에서 일했습니다. 회사별 업무와 담당 역할은 [경력 상세](https://kcenon.github.io/kcenon/portfolio/#career)에 정리되어 있습니다.

## 연락하기

의료영상, 시스템 엔지니어링, AI 개발 자동화 분야의 기술 리더십과 협업에 관한 대화를 환영합니다.

[이메일](mailto:kcenon@gmail.com) · [LinkedIn](https://www.linkedin.com/in/raphaelshin/) · [포트폴리오](https://kcenon.github.io/kcenon/portfolio/)
