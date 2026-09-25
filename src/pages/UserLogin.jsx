import { useState } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import {
  FiFileText,
  FiRefreshCw,
  FiShield,
  FiLayers,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

// ─── Theme ─────────────────────────────────────────────────────────────────────
const T = {
  // Page background
  pageBg:    "#F4F7FB",
  pageBg2:   "#EAF0F8",

  // Left panel
  panelFrom: "#0F172A",   // Deep navy
  panelMid:  "#1E3A8A",   // Royal blue
  panelTo:   "#2563EB",   // Bright blue

  // Accent
  accent:    "#60A5FA",
  accent2:   "#BFDBFE",

  // General
  white:     "#FFFFFF",
  formBg:    "#FFFFFF",
  text:      "#0F172A",
  muted:     "#64748B",
  border:    "#DCE3EE",

  // Inputs
  inputBg:   "#F8FAFC",

  // Button
  btn:       "#2563EB",
  btnHover:  "#1D4ED8",
};

// ─── Keyframes ─────────────────────────────────────────────────────────────────
const floatY = keyframes`
  0%,100% { transform: translateY(0) rotate(-3deg); }
  50%      { transform: translateY(-14px) rotate(3deg); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const slideR = keyframes`
  from { opacity: 0; transform: translateX(-26px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const pulseBadge = keyframes`
  0%,100% { box-shadow: 0 0 0 0 rgba(124,147,255,0.45); }
  50%      { box-shadow: 0 0 0 8px rgba(124,147,255,0); }
`;

// ─── Global ────────────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    background: ${T.pageBg};
  }
`;

// ─── Page ──────────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(145deg, ${T.pageBg} 0%, ${T.pageBg2} 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 120px 16px;
`;

const Blob = styled.div`
  position: absolute;
  border-radius: 50%;
  background: ${({ $c }) => $c};
  width: ${({ $w }) => $w};
  height: ${({ $w }) => $w};
  top: ${({ $t }) => $t ?? "auto"};
  left: ${({ $l }) => $l ?? "auto"};
  right: ${({ $r }) => $r ?? "auto"};
  bottom: ${({ $b }) => $b ?? "auto"};
  opacity: ${({ $o }) => $o ?? 0.18};
  pointer-events: none;
  filter: blur(70px);
`;

const GridOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(52,87,224,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(52,87,224,0.05) 1px, transparent 1px);
  background-size: 46px 46px;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 40%, transparent 90%);
`;

// ─── Card ──────────────────────────────────────────────────────────────────────
const Card = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  width: min(960px, 100%);
  min-height: 560px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 30px 70px rgba(16,24,64,0.16),
    0 0 0 1px rgba(124,147,255,0.16);
  animation: ${fadeUp} 0.65s ease both;

  @media (max-width: 720px) {
    flex-direction: column;
    min-height: unset;
  }
`;

// ─── Left Panel ────────────────────────────────────────────────────────────────
const Left = styled.div`
  flex: 1.05;
  background: linear-gradient(150deg, ${T.panelFrom} 0%, ${T.panelMid} 55%, ${T.panelTo} 100%);
  padding: 44px 38px 40px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
    background-size: 22px 22px;
    pointer-events: none;
  }

  @media (max-width: 720px) {
    padding: 36px 26px 32px;
  }
`;

const FloatIcon = styled.div`
  position: absolute;
  right: 18px; top: 30px;
  font-size: 100px;
  color: rgba(255,255,255,0.07);
  animation: ${floatY} 5s ease-in-out infinite;

  @media (max-width: 720px) { display: none; }
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 34px;
  animation: ${slideR} 0.5s ease both 0.1s;
`;
const LogoBadge = styled.div`
  width: 50px; height: 50px;
  border-radius: 14px;
  background: rgba(255,255,255,0.14);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(255,255,255,0.24);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; color: ${T.white};
  animation: ${pulseBadge} 2.8s ease infinite;
  flex-shrink: 0;
`;
const LogoName = styled.div`
  font-size: 17px; font-weight: 800;
  letter-spacing: -0.01em;
  color: ${T.white}; line-height: 1.2;
`;
const LogoSub = styled.div`
  font-size: 9.5px; font-weight: 800;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: ${T.accent2};
  margin-top: 3px;
`;

const Headline = styled.h1`
  font-size: clamp(21px, 2.6vw, 29px);
  font-weight: 800;
  letter-spacing: -0.01em;
  color: ${T.white};
  line-height: 1.3;
  margin-bottom: 10px;
  animation: ${slideR} 0.5s ease both 0.2s;

  em {
    font-style: normal;
    color: ${T.accent2};
  }
`;

const Sub = styled.p`
  font-size: 12.5px;
  color: rgba(255,255,255,0.6);
  line-height: 1.65;
  margin-bottom: 26px;
  animation: ${slideR} 0.5s ease both 0.3s;
`;

const ModulesLabel = styled.p`
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 2.2px;
  text-transform: uppercase;
  color: ${T.accent2};
  margin-bottom: 11px;
  animation: ${slideR} 0.5s ease both 0.35s;
`;

const ModulesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  animation: ${slideR} 0.5s ease both 0.4s;

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

const ModuleCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 13px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 13px;
  cursor: default;
  transition: all 0.22s ease;

  &:hover {
    background: rgba(124,147,255,0.16);
    border-color: rgba(124,147,255,0.36);
    transform: translateY(-2px);
  }
`;
const ModuleIcon = styled.div`
  width: 33px; height: 33px;
  border-radius: 9px;
  background: rgba(124,147,255,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: ${T.accent2};
  flex-shrink: 0;
`;
const ModuleTitle = styled.div`
  font-size: 11.5px;
  font-weight: 700;
  color: rgba(255,255,255,0.92);
  line-height: 1.25;
`;
const ModuleDesc = styled.div`
  font-size: 9.5px;
  color: rgba(255,255,255,0.42);
  margin-top: 2px;
`;

const LeftFooter = styled.div`
  margin-top: auto;
  padding-top: 26px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,0.4);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.3px;

  svg { font-size: 13px; }
`;

// ─── Right Panel ───────────────────────────────────────────────────────────────
const Right = styled.form`
  flex: 0.95;
  background: ${T.formBg};
  padding: 52px 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: ${fadeUp} 0.65s ease both 0.15s;

  @media (max-width: 720px) {
    padding: 36px 26px 44px;
  }
`;

const Welcome = styled.h2`
  font-size: clamp(21px, 2.8vw, 27px);
  font-weight: 800;
  letter-spacing: -0.01em;
  color: ${T.text};
  margin-bottom: 5px;
`;
const WelcomeSub = styled.p`
  font-size: 12.5px;
  color: ${T.muted};
  margin-bottom: 10px;
`;
const AccentBar = styled.div`
  width: 42px; height: 3.5px;
  border-radius: 4px;
  background: linear-gradient(90deg, ${T.btn}, ${T.accent});
  margin-bottom: 28px;
`;

// ─── Shared field components ────────────────────────────────────────────────────
const FieldWrap = styled.div`
  margin-bottom: 18px;
`;
const FieldLabel = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  color: ${T.text};
  margin-bottom: 7px;
`;
const InputWrap = styled.div`
  position: relative;
`;
const LeadIcon = styled.span`
  position: absolute;
  left: 14px; top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  color: ${({ $on }) => ($on ? T.btn : T.muted)};
  display: flex;
  transition: color 0.2s;
`;
const TrailBtn = styled.button`
  position: absolute;
  right: 12px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  cursor: pointer;
  color: ${T.muted};
  font-size: 15px; display: flex;
  padding: 4px;
  transition: color 0.2s;
  &:hover { color: ${T.btn}; }
`;
const StyledInput = styled.input`
  width: 100%;
  padding: 13px 42px;
  border: 1.5px solid ${({ $on }) => ($on ? T.btn : T.border)};
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 13.5px;
  color: ${T.text};
  background: ${({ $on }) => ($on ? T.white : T.inputBg)};
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  box-shadow: ${({ $on }) => ($on ? "0 0 0 3px rgba(52,87,224,0.12)" : "none")};

  &::placeholder { color: #9AA6C3; }
  &:hover:not(:focus) { border-color: rgba(52,87,224,0.38); }
`;


const SignInBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, ${T.btn}, ${T.btnHover});
  color: ${T.white};
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 800;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: all 0.25s ease;
  box-shadow: 0 8px 24px rgba(52,87,224,0.32);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 32px rgba(52,87,224,0.42);
    background: linear-gradient(135deg, #4468F5, ${T.btn});
  }
  &:active { transform: translateY(0); }
  svg { font-size: 16px; }
`;

const FormFooter = styled.p`
  font-size: 10.5px;
  color: ${T.muted};
  text-align: center;
  margin-top: 22px;
  opacity: 0.7;
`;

// ─── Static data ───────────────────────────────────────────────────────────────
const MODULES = [
  { icon: <FiFileText  />, title: "Sales Reinbursement Fees",  desc: "Manage Reinbursment Fees"    },
  // { icon: <FiRefreshCw />, title: "Activity Document upoad",  desc: "Add, Edit and Delete Document from Activity"         },
  // { icon: <FiShield    />, title: "Email Template",        desc: "Add or Modify Email template"     },
  // { icon: <FiLayers    />, title: "Automate Email Template",      desc: "Automate Email sending"       },
];

// ─── Reusable input field ──────────────────────────────────────────────────────
function Field({ id, label, type, placeholder, value, onChange, leadIcon, trail, isFocused, onFocus, onBlur }) {
  return (
    <FieldWrap>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputWrap>
        <LeadIcon $on={isFocused}>{leadIcon}</LeadIcon>
        <StyledInput
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          $on={isFocused}
          autoComplete={id === "password" ? "current-password" : "username"}
        />
        {trail}
      </InputWrap>
    </FieldWrap>
  );
}

// ─── Root component ────────────────────────────────────────────────────────────
export default function UserLogin() {
  const { SeaFoodLogin } = useAuth()
  const [formData,  setFormData]  = useState({ userName: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [focus,   setFocus]   = useState({ userId: false, password: false });
  const [showPwd, setShowPwd] = useState(false);

  const onChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onFocus  = (k) => setFocus((p)  => ({ ...p, [k]: true  }));
  const onBlur   = (k) => setFocus((p)  => ({ ...p, [k]: false }));

    const handleSubmit = async(e) => {
      e.preventDefault();
      setLoading(true);
      
      console.log('Login attempt:', formData);
  
      try {
        
        if(formData.userName && formData.password){
          const userData = {
            username: formData.userName,
            password: formData.password
          }
          await SeaFoodLogin(userData);
        }
      } catch (error) {
        toast.error("Invalid credentials. Please try again.")
        
      }finally{
        setLoading(false)
      }
    };

  return (
    <>
      <GlobalStyle />
      <Page>
        {/* Background blobs */}
        <Blob $c="rgba(52,87,224,0.16)"  $w="480px" $t="-130px" $l="-100px" />
        <Blob $c="rgba(124,147,255,0.14)" $w="380px" $b="-80px"  $r="-80px"  />
        <Blob $c="rgba(52,87,224,0.08)"  $w="280px" $t="42%"    $l="62%"    />

        {/* Subtle grid pattern */}
        <GridOverlay />

        <Card>
          {/* ══ LEFT ══ */}
          <Left>
            <FloatIcon><FiFileText /></FloatIcon>

            <LogoRow>
              <LogoBadge><FiFileText /></LogoBadge>
              <div>
                <LogoName>Sales</LogoName>
                {/* <LogoSub>Enterprise Doccket Management Platform</LogoSub> */}
              </div>
            </LogoRow>

            <Headline>
              Manage Sales,<br />
              <em>Securely Organized</em>
            </Headline>

            {/* <Sub>
              Centralize business documents, automate workflows, and collaborate securely
              from a single platform.
            </Sub> */}

            <ModulesLabel>Platform Capabilities</ModulesLabel>

            <ModulesGrid>
              {MODULES.map(({ icon, title, desc }) => (
                <ModuleCard key={title}>
                  <ModuleIcon>{icon}</ModuleIcon>
                  <div>
                    <ModuleTitle>{title}</ModuleTitle>
                    <ModuleDesc>{desc}</ModuleDesc>
                  </div>
                </ModuleCard>
              ))}
            </ModulesGrid>

            {/* <LeftFooter>
              <FiShield />
              <span>Enterprise-grade security & compliance</span>
            </LeftFooter> */}
          </Left>

          {/* ══ RIGHT ══ */}
          <Right onSubmit={handleSubmit}>
            <Welcome>Welcome Back</Welcome>
            <WelcomeSub>Please sign in your account </WelcomeSub>
            <AccentBar />

            <Field
              id="userName"
              label="User Name"
              type="text"
              placeholder="Enter your user name"
              value={formData.userId}
              onChange={onChange}
              leadIcon={<FiUser />}
              isFocused={focus.userName}
              onFocus={() => onFocus("userName")}
              onBlur={() => onBlur("userName")}
            />

            <Field
              id="password"
              label="Password"
              type={showPwd ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={onChange}
              leadIcon={<FiLock />}
              trail={
                <TrailBtn type="button" onClick={() => setShowPwd((p) => !p)}>
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </TrailBtn>
              }
              isFocused={focus.password}
              onFocus={() => onFocus("password")}
              onBlur={() => onBlur("password")}
            />

            {/* <ForgotRow>
              <ForgotLink>Forgot Password?</ForgotLink>
            </ForgotRow> */}

            <SignInBtn type="submit">
              Login <FiArrowRight />
            </SignInBtn>

          </Right>
        </Card>
      </Page>
    </>
  );
}
