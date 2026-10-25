import { useState, type FormEvent } from "react";
import {
  Button,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Text,
  Title2,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { EyeOffRegular, EyeRegular } from "@fluentui/react-icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthProvider";

const useStyles = makeStyles({
  container: {
    minHeight: "calc(100vh - 112px)",
    display: "grid",
    placeItems: "center",
    padding: "24px 16px",
  },
  panel: {
    width: "100%",
    maxWidth: "420px",
    display: "grid",
    gap: "20px",
    padding: "32px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow16,
  },
  form: {
    display: "grid",
    gap: "16px",
  },
  switcher: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "4px",
  },
});

export function AuthPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const isSignup = searchParams.get("mode") === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const normalizedEmail = email.trim();
      if (isSignup) {
        await api.register(normalizedEmail, password, nickname.trim());
      }
      await api.login(normalizedEmail, password);
      await refreshUser();
      navigate("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "요청을 처리하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setError(null);
    setSearchParams({ mode: isSignup ? "login" : "signup" });
  }

  return (
    <div className={styles.container}>
      <section className={styles.panel} aria-labelledby="auth-title">
        <div>
          <Title2 id="auth-title" as="h1">
            {isSignup ? "계정 만들기" : "다시 만나요"}
          </Title2>
          <Text style={{ display: "block", marginTop: "8px", color: tokens.colorNeutralForeground2 }}>
            {isSignup ? "심심풀이 계정을 만들고 바로 시작하세요." : "로그인하고 게임을 이어서 즐겨보세요."}
          </Text>
        </div>

        <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
          {isSignup && (
            <Field label="닉네임">
              <Input
                value={nickname}
                onChange={(_, data) => setNickname(data.value)}
                autoComplete="nickname"
                maxLength={40}
                required
              />
            </Field>
          )}
          <Field label="이메일">
            <Input
              type="email"
              value={email}
              onChange={(_, data) => setEmail(data.value)}
              autoComplete="email"
              required
            />
          </Field>
          <Field label="비밀번호" hint="6자 이상 입력하세요.">
            <Input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(_, data) => setPassword(data.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={6}
              required
              contentAfter={(
                <Button
                  type="button"
                  appearance="transparent"
                  size="small"
                  icon={passwordVisible ? <EyeOffRegular /> : <EyeRegular />}
                  aria-label={passwordVisible ? "비밀번호 숨기기" : "비밀번호 표시"}
                  aria-pressed={passwordVisible}
                  onClick={() => setPasswordVisible((visible) => !visible)}
                />
              )}
            />
          </Field>
          {error && (
            <MessageBar intent="error">
              <MessageBarBody>{error}</MessageBarBody>
            </MessageBar>
          )}
          <Button type="submit" appearance="primary" disabled={submitting}>
            {submitting ? "처리 중..." : isSignup ? "회원가입" : "로그인"}
          </Button>
        </form>

        <div className={styles.switcher}>
          <Text>{isSignup ? "이미 계정이 있나요?" : "처음이신가요?"}</Text>
          <Button appearance="subtle" onClick={toggleMode}>
            {isSignup ? "로그인" : "회원가입"}
          </Button>
        </div>
      </section>
    </div>
  );
}