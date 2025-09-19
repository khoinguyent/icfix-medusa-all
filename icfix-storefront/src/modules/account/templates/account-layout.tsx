import AccountNav from "@modules/account/components/account-nav"
import { B2BCustomer } from "@types"
import React from "react"

interface AccountLayoutProps {
  customer: B2BCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = async ({
  customer,
  children,
}) => {
  return (
    <div
      className="flex-1 small:py-12 bg-neutral-100"
      data-testid="account-page"
    >
      <div className="flex-1 content-container h-full max-w-7xl mx-auto flex flex-col">
        <div className="grid grid-cols-1  small:grid-cols-[240px_1fr] py-12">
          <div>
            {customer && <AccountNav customer={customer} />}
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
