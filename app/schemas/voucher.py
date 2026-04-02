from pydantic import BaseModel

class VoucherBase(BaseModel):
    voucher_code: str
    course_name: str

class VoucherCreate(VoucherBase):
    pass

class VoucherResponse(VoucherBase):
    id: int
    is_used: bool

    class Config:
        from_attributes = True