/** Demo dữ liệu — thay bằng API sau */
export const STUDENT_STATS = [
  {
    id: 'total',
    label: 'Tổng học sinh',
    value: '1.086',
    hint: 'Tăng 12 học sinh so với tuần trước',
    icon: 'groups',
    borderClass: 'border-l-4 border-primary',
    circleClass: 'bg-primary-fixed text-primary',
    fillIcon: true,
  },
  {
    id: 'saodo',
    label: 'Thuộc đội Sao Đỏ',
    value: '186',
    hint: 'Khối 10, 11 & 12',
    icon: 'verified_user',
    borderClass: 'border-l-4 border-secondary',
    circleClass: 'bg-secondary-fixed text-secondary',
    fillIcon: true,
  },
  {
    id: 'new',
    label: 'Hồ sơ cần bổ sung',
    value: '08',
    hint: 'Ảnh / liên hệ PH',
    icon: 'assignment_late',
    borderClass: 'border-l-4 border-tertiary',
    circleClass: 'bg-tertiary-fixed text-tertiary',
    fillIcon: true,
  },
]

export const STUDENTS = [
  {
    code: 'HS2024001',
    name: 'Nguyễn Minh Anh',
    email: 'anh.nm@student.school.edu.vn',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDi2wwOl6sHTSob9WpRkHz84JQpvSx2cVmO700bf6YZiyEIedK6AlgB1aL22Xgeg7Uq-iKkaibuQopUw0CxKdDtEMr4UjGZpJaleTW2XegomEXQAEnJQop-ZkGHUYkmuHd2LB5XcCpTghDrTP_oBbp8aPYQl0dR60UVs2MLo1hQ7TmGxG0ReKE7-WwCzPriDqr_l5t_w4onfzkkW3oyXXyDwHfGoeBRbdLwEQ8UE0jjS-Oi1N2RMViPQwgg96yi8QDzr7WJ3FtXYio',
    className: '10A1',
    saoDo: true,
    parentPhone: '090 123 4567',
    status: 'active',
  },
  {
    code: 'HS2024014',
    name: 'Lê Thị Mai',
    email: 'mai.lt@student.school.edu.vn',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAlntUdYtM-qwjjQC6wIjlxk2RATL_r25_dJlfHIzgXtmV-jmAb6PK-2-n-aZbNrryA33-w7COnhMvDIutNtRWNga5pe31FQ9aNsnFQe_8Ww-pQrBOJkECj1ajilu_AqJQ-976My0xneQBBSzA4Lz3sTJ7NdMuXLye-yKzm-j5qUyGgQZPusLJwbwWywOdF5H4SfhTizilRiT9D4wuW8M5LPa5VB2RSfZ_spfNDqfWDE50ohKfLTVkrV0zgez1udeOP2mmY2OH80Pc',
    className: '10C2',
    saoDo: true,
    parentPhone: '091 987 6543',
    status: 'active',
  },
  {
    code: 'HS2024022',
    name: 'Trần Minh Quân',
    email: 'quan.tm@student.school.edu.vn',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4ncyH5B4oeqLtlW1bux3_qZgJao1FbjPnF2Y2dmHHw954Sx_WTmydIiNw1ipJY2OGGyPqdbSaKsx740Aq0SQTwligMQftK1z2LgP8g3c_XT77na38ZrKk3O0xN3Sdj-zrLh0J0KGJ8Vixj0sVZGrsY5vAqjM-xQX_R3qFi4OzKNg3Ak7BL0UvGlhQdk2IvKlxeJOHTD0CvFFA8CswPili8Vv4e79M6xIFPfUIj6Spq3wquMI7CCanOpMhj1Qc3ixBDXK4opxZvoI',
    className: '11B1',
    saoDo: false,
    parentPhone: '098 765 4321',
    status: 'deferred',
  },
  {
    code: 'HS2024045',
    name: 'Phạm Ngọc Lan',
    email: 'lan.pn@student.school.edu.vn',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAf4KC-JfFn_abzaMpkVWVIVFfV-57poP2hTJKvEUkasTvBhx52coKvLymFjSFSxpz9EYC80NaDPLzkk7vzcfJCNqUubs9Oe-zo0QAmFnLln8V_F4C_1N0f4iwvrfFrog8PdahM2v-BOBWZM2Fg-dxBVZEghQ2Be8VPEFdtAM039UosQ6CfDaGjvVIkP_rEpH3DpgvYpLHzIoGpx-IIuh1PYhYb9EQkn0gaiORS4aOj1Ywd4yfg1DPA0wJbnNMLTX6n-YBQstPZ2tk',
    className: '11B3',
    saoDo: true,
    parentPhone: '094 222 3344',
    status: 'active',
  },
  {
    code: 'HS2024088',
    name: 'Hoàng Công Thành',
    email: 'thanh.hc@student.school.edu.vn',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBy77XEf74u6iAIDQjcupMd2wMr_51AD3XoDhXYSPWj5gCNOFUJfy85uD_qmxEu7_dO_72RoaavIpmDvoJJyqpHwb8ywSvGSVFojrZiAsYVRyhn8_aDK3mdzilQRJarI3wh8jWoz65a4qw3ynfiou2eQDOvVC8g9v_-gRFhBU21sLygMRNYX9eABvDuF-ug_Y-xrYLa-ZeSFHrF-iA42GYO_8n47XM4poe_G15NWwe-JggVXeQhNWg2urEr1G--Tdlwfcr6Gsi7CQM',
    className: '12A1',
    saoDo: false,
    parentPhone: '096 111 2233',
    status: 'inactive',
  },
]

export const STUDENT_LIST_TOTAL = 1086
