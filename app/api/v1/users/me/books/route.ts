import { NextResponse } from 'next/server'

// TODO: 실제 데이터베이스 연결 및 인증 로직 구현
export async function GET() {
  try {
    // TODO: 실제 인증 로직 구현
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // TODO: 실제 데이터베이스에서 사용자의 책 목록 조회
    // const books = await prisma.book.findMany({
    //   where: { userId: session.user.id },
    //   include: { notes: true, quotes: true }
    // })

    // 임시 목 데이터 (개발용)
    const mockBooks = [
      {
        id: "1",
        title: "아토믹 해빗",
        author: "제임스 클리어",
        cover: "/placeholder.svg?height=200&width=150",
        category: "자기계발",
        progress: 75,
        currentPage: 225,
        totalPages: 300,
        createdAt: "2024-01-15T00:00:00.000Z",
        startDate: "2024-01-15T00:00:00.000Z",
        endDate: null,
        isbn: "9788934985907",
        publisher: "비즈니스북스",
        description: "작은 변화가 만드는 놀라운 결과에 대한 책",
        notes: [
          {
            id: "1",
            title: "1% 법칙의 힘",
            content: "매일 1%씩 개선하면 1년 후 37배 성장한다. 작은 변화가 복리 효과를 만든다.",
            tags: ["핵심개념", "수학"],
            createdAt: "2024-01-16T00:00:00.000Z",
            updatedAt: "2024-01-16T00:00:00.000Z",
            isImportant: true,
          },
          {
            id: "2",
            title: "습관 스택킹",
            content: '기존 습관에 새로운 습관을 연결하는 방법. "커피를 마신 후에 명상을 5분 한다"',
            tags: ["실천방법", "습관"],
            createdAt: "2024-01-18T00:00:00.000Z",
            updatedAt: "2024-01-18T00:00:00.000Z",
            isImportant: false,
          },
        ],
        quotes: [
          {
            id: "1",
            text: "성공은 매일의 습관이 만들어내는 결과다. 당신이 반복하는 것이 당신이 된다.",
            page: 45,
            chapter: "1장",
            thoughts: "정말 와닿는 말이다. 작은 습관들이 모여서 큰 변화를 만든다는 것을 깨달았다.",
            tags: ["핵심", "동기부여"],
            createdAt: "2024-01-17T00:00:00.000Z",
            updatedAt: "2024-01-17T00:00:00.000Z",
            isImportant: true,
          },
          {
            id: "2",
            text: "변화의 가장 효과적인 방법은 무엇을 하려고 하는지가 아니라 누가 되려고 하는지에 집중하는 것이다.",
            page: 78,
            thoughts: "정체성 기반 습관의 중요성을 알게 되었다.",
            tags: ["정체성", "변화"],
            createdAt: "2024-01-19T00:00:00.000Z",
            updatedAt: "2024-01-19T00:00:00.000Z",
            isImportant: false,
          },
        ],
      },
      {
        id: "2",
        title: "클린 코드",
        author: "로버트 C. 마틴",
        cover: "/placeholder.svg?height=200&width=150",
        category: "개발",
        progress: 100,
        currentPage: 400,
        totalPages: 400,
        createdAt: "2024-02-01T00:00:00.000Z",
        startDate: "2024-02-01T00:00:00.000Z",
        endDate: "2024-02-28T00:00:00.000Z",
        isbn: "9788966260959",
        publisher: "인사이트",
        description: "애자일 소프트웨어 장인 정신",
        notes: [
          {
            id: "3",
            title: "의미있는 이름 짓기",
            content: "변수명, 함수명은 그 의도를 명확히 드러내야 한다. 주석이 필요없을 정도로.",
            tags: ["네이밍", "기본원칙"],
            createdAt: "2024-02-02T00:00:00.000Z",
            updatedAt: "2024-02-02T00:00:00.000Z",
            isImportant: true,
          },
        ],
        quotes: [
          {
            id: "3",
            text: "깨끗한 코드는 한 가지를 제대로 한다.",
            page: 15,
            chapter: "1장",
            thoughts: "단순하지만 강력한 원칙이다. 하나의 함수는 하나의 일만 해야 한다.",
            tags: ["원칙", "설계"],
            createdAt: "2024-02-03T00:00:00.000Z",
            updatedAt: "2024-02-03T00:00:00.000Z",
            isImportant: true,
          },
        ],
      },
      {
        id: "3",
        title: "사피엔스",
        author: "유발 하라리",
        cover: "/placeholder.svg?height=200&width=150",
        category: "역사",
        progress: 20,
        currentPage: 80,
        totalPages: 400,
        createdAt: "2024-02-10T00:00:00.000Z",
        startDate: "2024-02-10T00:00:00.000Z",
        endDate: null,
        isbn: "9788934972464",
        publisher: "김영사",
        description: "유인원에서 사이보그까지, 인간 역사의 대담하고 위대한 질문",
        notes: [],
        quotes: [],
      },
    ]

    return NextResponse.json(mockBooks)
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 